"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.updateMessage = exports.markConversationRead = exports.createTaskGroupConversation = exports.sendMessage = exports.getMessages = exports.createConversation = exports.getConversations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Conversation_js_1 = __importDefault(require("../models/Conversation.js"));
const Message_js_1 = __importDefault(require("../models/Message.js"));
const User_js_1 = require("../models/User.js");
const Task_js_1 = require("../models/Task.js");
const notificationService_js_1 = require("../services/notificationService.js");
const socketService_js_1 = require("../services/socketService.js");
const emailService_js_1 = require("../services/emailService.js");
const sanitizeContent = (text) => text.trim().slice(0, 5000);
const mapConversation = (conv, currentUserId) => {
    const unread = conv.unreadCounts instanceof Map
        ? conv.unreadCounts.get(currentUserId) || 0
        : (conv.unreadCounts?.[currentUserId] || 0);
    return {
        id: conv._id,
        type: conv.type,
        name: conv.name,
        teamId: conv.teamId,
        participantIds: conv.participantIds,
        createdBy: conv.createdBy,
        lastMessageAt: conv.lastMessageAt,
        lastMessageSnippet: conv.lastMessageSnippet,
        lastMessageSender: conv.lastMessageSender,
        unread,
    };
};
// List conversations for current user
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const conversations = await Conversation_js_1.default.find({ participantIds: userId })
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .lean();
        res.json(conversations.map((c) => mapConversation(c, userId)));
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Failed to get conversations' });
    }
};
exports.getConversations = getConversations;
// Create conversation (direct or team)
const createConversation = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { type = 'direct', participantIds = [], name, teamId } = req.body;
        const uniqueParticipants = Array.from(new Set([...participantIds, userId]));
        if (type === 'direct' && uniqueParticipants.length !== 2) {
            return res.status(400).json({ message: 'Direct conversations must have exactly 2 participants' });
        }
        if (uniqueParticipants.length < 2) {
            return res.status(400).json({ message: 'A conversation needs at least 2 participants' });
        }
        if (type === 'direct') {
            const existing = await Conversation_js_1.default.findOne({
                type: 'direct',
                participantIds: { $all: uniqueParticipants, $size: uniqueParticipants.length },
            });
            if (existing) {
                return res.json(mapConversation(existing, userId));
            }
        }
        const conversation = new Conversation_js_1.default({
            type,
            name,
            teamId,
            participantIds: uniqueParticipants,
            createdBy: userId,
            unreadCounts: {},
        });
        uniqueParticipants.forEach((pid) => {
            conversation.unreadCounts.set(pid.toString(), 0);
        });
        await conversation.save();
        res.status(201).json(mapConversation(conversation, userId));
    }
    catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ message: 'Failed to create conversation' });
    }
};
exports.createConversation = createConversation;
// Get messages in a conversation
const getMessages = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;
        const conversation = await Conversation_js_1.default.findById(conversationId);
        if (!conversation || !conversation.participantIds.some((id) => id.toString() === userId)) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        const query = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }
        const messages = await Message_js_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .sort({ createdAt: 1 })
            .lean();
        res.json(messages);
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to get messages' });
    }
};
exports.getMessages = getMessages;
// Send a message
const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { conversationId } = req.params;
        const { content } = req.body;
        if (!content || !sanitizeContent(content)) {
            return res.status(400).json({ message: 'Message content is required' });
        }
        const conversation = await Conversation_js_1.default.findById(conversationId);
        if (!conversation || !conversation.participantIds.some((id) => id.toString() === userId)) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        const safeContent = sanitizeContent(content);
        const message = new Message_js_1.default({
            conversationId: new mongoose_1.default.Types.ObjectId(conversationId),
            senderId: userId,
            content: safeContent,
            readBy: [userId],
        });
        await message.save();
        conversation.lastMessageAt = new Date();
        conversation.lastMessageSnippet = safeContent.slice(0, 140);
        conversation.lastMessageSender = new mongoose_1.default.Types.ObjectId(userId);
        conversation.participantIds.forEach((pid) => {
            const key = pid.toString();
            if (key === userId) {
                conversation.unreadCounts.set(key, 0);
            }
            else {
                const current = conversation.unreadCounts.get(key) || 0;
                conversation.unreadCounts.set(key, current + 1);
            }
        });
        await conversation.save();
        // Notify participants
        const participants = conversation.participantIds.map((id) => id.toString());
        const others = participants.filter((id) => id !== userId);
        // Emit socket events and create notifications
        const conversationPayload = mapConversation(conversation, userId);
        // Mention detection (@<mongodb id>)
        const mentionIds = new Set();
        const mentionRegex = /@([a-f\d]{24})/gi;
        let match;
        while ((match = mentionRegex.exec(safeContent)) !== null) {
            mentionIds.add(match[1]);
        }
        for (const participantId of others) {
            (0, socketService_js_1.emitToUser)(participantId, 'message:new', {
                conversationId,
                message,
                conversation: mapConversation(conversation, participantId),
            });
            // In-app notification
            const sender = req.user;
            await (0, notificationService_js_1.createNotification)({
                userId: participantId,
                fromUserId: userId,
                action: 'sent you a message',
                target: sender?.name || 'New message',
                targetType: 'message',
            });
            (0, socketService_js_1.emitToUser)(participantId, 'notification:new', {
                _id: `${conversationId}-${Date.now()}`,
                type: 'message',
                title: sender?.name ? `${sender.name} sent a message` : 'New message',
                message: safeContent.slice(0, 120),
                read: false,
                createdAt: new Date().toISOString(),
                data: { conversationId, senderId: userId },
            });
            // Email if enabled
            const recipient = await User_js_1.User.findById(participantId);
            const senderUser = await User_js_1.User.findById(userId);
            if (recipient && senderUser) {
                await (0, emailService_js_1.sendMessageNotificationEmail)(recipient, senderUser, safeContent, conversation);
            }
        }
        // Mention notifications (dedupe)
        for (const mentionedId of mentionIds) {
            if (mentionedId === userId)
                continue;
            if (!conversation.participantIds.some((id) => id.toString() === mentionedId))
                continue;
            const sender = req.user;
            await (0, notificationService_js_1.createNotification)({
                userId: mentionedId,
                fromUserId: userId,
                action: 'mentioned you in a message',
                target: sender?.name || 'New mention',
                targetType: 'message',
            });
            (0, socketService_js_1.emitToUser)(mentionedId, 'notification:new', {
                _id: `${conversationId}-mention-${Date.now()}`,
                type: 'message_mention',
                title: sender?.name ? `${sender.name} mentioned you` : 'You were mentioned',
                message: safeContent.slice(0, 120),
                read: false,
                createdAt: new Date().toISOString(),
                data: { conversationId, senderId: userId },
            });
        }
        res.status(201).json({ message, conversation: conversationPayload });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};
exports.sendMessage = sendMessage;
// Create a group conversation for a task (admin/manager only)
const createTaskGroupConversation = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return res.status(403).json({ message: 'Only admins or managers can create task groups' });
        }
        const { taskId } = req.params;
        const task = await Task_js_1.Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const participantIds = new Set();
        (task.assignees || []).forEach((a) => participantIds.add(a.toString()));
        if (task.reporter)
            participantIds.add(task.reporter.toString());
        participantIds.add(user._id.toString());
        const participantArray = Array.from(participantIds);
        // Check if an existing group for this task exists (by name + participants)
        const existing = await Conversation_js_1.default.findOne({
            type: 'team',
            name: { $regex: `^Task:${taskId}` },
            participantIds: { $all: participantArray, $size: participantArray.length },
        });
        if (existing) {
            return res.json(mapConversation(existing, user._id.toString()));
        }
        const conversation = new Conversation_js_1.default({
            type: 'team',
            name: `Task:${taskId} • ${task.title}`,
            participantIds: participantArray,
            createdBy: user._id,
            unreadCounts: {},
        });
        participantArray.forEach((pid) => conversation.unreadCounts.set(pid, 0));
        await conversation.save();
        res.status(201).json(mapConversation(conversation, user._id.toString()));
    }
    catch (error) {
        console.error('Create task group error:', error);
        res.status(500).json({ message: 'Failed to create task group conversation' });
    }
};
exports.createTaskGroupConversation = createTaskGroupConversation;
// Mark conversation read
const markConversationRead = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { conversationId } = req.params;
        const conversation = await Conversation_js_1.default.findById(conversationId);
        if (!conversation || !conversation.participantIds.some((id) => id.toString() === userId)) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        conversation.unreadCounts.set(userId, 0);
        await conversation.save();
        await Message_js_1.default.updateMany({ conversationId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Mark conversation read error:', error);
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};
exports.markConversationRead = markConversationRead;
// Edit a message (sender only)
const updateMessage = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { messageId } = req.params;
        const { content } = req.body;
        if (!content || !sanitizeContent(content)) {
            return res.status(400).json({ message: 'Message content is required' });
        }
        const message = await Message_js_1.default.findById(messageId);
        if (!message)
            return res.status(404).json({ message: 'Message not found' });
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'Only the sender can edit this message' });
        }
        if (message.deleted) {
            return res.status(400).json({ message: 'Cannot edit a deleted message' });
        }
        message.content = sanitizeContent(content);
        message.edited = true;
        await message.save();
        const conversation = await Conversation_js_1.default.findById(message.conversationId);
        if (conversation) {
            conversation.participantIds.forEach((pid) => {
                (0, socketService_js_1.emitToUser)(pid.toString(), 'message:updated', { message });
            });
        }
        res.json({ message });
    }
    catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ message: 'Failed to update message' });
    }
};
exports.updateMessage = updateMessage;
// Delete a message (sender only, soft delete)
const deleteMessage = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { messageId } = req.params;
        const message = await Message_js_1.default.findById(messageId);
        if (!message)
            return res.status(404).json({ message: 'Message not found' });
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'Only the sender can delete this message' });
        }
        message.content = '[deleted]';
        message.deleted = true;
        message.edited = true;
        await message.save();
        const conversation = await Conversation_js_1.default.findById(message.conversationId);
        if (conversation) {
            conversation.participantIds.forEach((pid) => {
                (0, socketService_js_1.emitToUser)(pid.toString(), 'message:deleted', { messageId: message._id, conversationId: message.conversationId });
                (0, socketService_js_1.emitToUser)(pid.toString(), 'message:updated', { message });
            });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=messageController.js.map