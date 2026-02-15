"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMentionableUsers = exports.addReaction = exports.deleteComment = exports.updateComment = exports.createComment = exports.getCommentReplies = exports.getTaskComments = void 0;
const Comment_js_1 = __importDefault(require("../models/Comment.js"));
const User_js_1 = require("../models/User.js");
const Task_js_1 = require("../models/Task.js");
const notificationService_js_1 = __importDefault(require("../services/notificationService.js"));
// Get comments for a task
const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { includeReplies } = req.query;
        const query = { taskId, isDeleted: false };
        // By default, get only top-level comments
        if (includeReplies !== 'true') {
            query.parentId = { $exists: false };
        }
        const comments = await Comment_js_1.default.find(query)
            .populate('authorId', 'name email avatar')
            .populate('mentions.userId', 'name email avatar')
            .sort({ createdAt: -1 });
        // If we want replies nested
        if (includeReplies !== 'true') {
            // Get reply counts for each comment
            const commentIds = comments.map((c) => c._id);
            const replyCounts = await Comment_js_1.default.aggregate([
                { $match: { parentId: { $in: commentIds }, isDeleted: false } },
                { $group: { _id: '$parentId', count: { $sum: 1 } } },
            ]);
            const replyCountMap = new Map(replyCounts.map((r) => [r._id.toString(), r.count]));
            const commentsWithReplyCounts = comments.map((c) => ({
                ...c.toObject(),
                repliesCount: replyCountMap.get(c._id.toString()) || 0,
            }));
            return res.json(commentsWithReplyCounts);
        }
        res.json(comments);
    }
    catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
};
exports.getTaskComments = getTaskComments;
// Get replies for a comment
const getCommentReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const replies = await Comment_js_1.default.find({
            parentId: commentId,
            isDeleted: false,
        })
            .populate('authorId', 'name email avatar')
            .populate('mentions.userId', 'name email avatar')
            .sort({ createdAt: 1 });
        res.json(replies);
    }
    catch (error) {
        console.error('Get replies error:', error);
        res.status(500).json({ message: 'Failed to fetch replies' });
    }
};
exports.getCommentReplies = getCommentReplies;
// Create a comment
const createComment = async (req, res) => {
    try {
        const user = req.user;
        const { taskId } = req.params;
        const { content, parentId, attachments } = req.body;
        // Verify task exists
        const task = await Task_js_1.Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Extract mentions from content
        const mentionRegex = /@(\w+)/g;
        const mentionMatches = [];
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            mentionMatches.push({
                username: match[1],
                startIndex: match.index,
                endIndex: match.index + match[0].length,
            });
        }
        // Resolve usernames to user IDs
        const usernames = mentionMatches.map((m) => m.username);
        const users = await User_js_1.User.find({
            $or: [
                { username: { $in: usernames } },
                { name: { $in: usernames.map((u) => new RegExp(`^${u}$`, 'i')) } },
            ],
        });
        const usernameMap = new Map(users.map((u) => [u.username?.toLowerCase() || u.name.toLowerCase().replace(/\s+/g, ''), u]));
        const mentions = mentionMatches
            .map((m) => {
            const foundUser = usernameMap.get(m.username.toLowerCase());
            if (foundUser) {
                return {
                    userId: foundUser._id,
                    username: m.username,
                    startIndex: m.startIndex,
                    endIndex: m.endIndex,
                };
            }
            return null;
        })
            .filter((m) => m !== null);
        const comment = new Comment_js_1.default({
            taskId,
            authorId: user._id,
            content,
            mentions,
            attachments: attachments || [],
            parentId,
        });
        await comment.save();
        // Populate author info
        await comment.populate('authorId', 'name email avatar');
        await comment.populate('mentions.userId', 'name email avatar');
        // Send notifications to mentioned users
        for (const mention of mentions) {
            if (mention && mention.userId.toString() !== user._id.toString()) {
                await notificationService_js_1.default.createNotification({
                    userId: mention.userId,
                    type: 'mention',
                    title: 'You were mentioned',
                    message: `${user.name} mentioned you in a comment on "${task.title}"`,
                    relatedEntity: {
                        type: 'task',
                        id: task._id,
                    },
                });
            }
        }
        // Notify task assignees (if not the commenter)
        const assignees = task.assignees || [];
        for (const assigneeId of assignees) {
            if (assigneeId.toString() !== user._id.toString()) {
                await notificationService_js_1.default.createNotification({
                    userId: assigneeId,
                    type: 'comment',
                    title: 'New comment on your task',
                    message: `${user.name} commented on "${task.title}"`,
                    relatedEntity: {
                        type: 'task',
                        id: task._id,
                    },
                });
            }
        }
        res.status(201).json(comment);
    }
    catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Failed to create comment' });
    }
};
exports.createComment = createComment;
// Update a comment
const updateComment = async (req, res) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await Comment_js_1.default.findOne({
            _id: commentId,
            authorId: user._id,
            isDeleted: false,
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        // Re-extract mentions
        const mentionRegex = /@(\w+)/g;
        const mentionMatches = [];
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            mentionMatches.push({
                username: match[1],
                startIndex: match.index,
                endIndex: match.index + match[0].length,
            });
        }
        const usernames = mentionMatches.map((m) => m.username);
        const users = await User_js_1.User.find({
            $or: [
                { username: { $in: usernames } },
                { name: { $in: usernames.map((u) => new RegExp(`^${u}$`, 'i')) } },
            ],
        });
        const usernameMap = new Map(users.map((u) => [u.username?.toLowerCase() || u.name.toLowerCase().replace(/\s+/g, ''), u]));
        comment.mentions = mentionMatches
            .map((m) => {
            const foundUser = usernameMap.get(m.username.toLowerCase());
            if (foundUser) {
                return {
                    userId: foundUser._id,
                    username: m.username,
                    startIndex: m.startIndex,
                    endIndex: m.endIndex,
                };
            }
            return null;
        })
            .filter((m) => m !== null);
        await comment.save();
        await comment.populate('authorId', 'name email avatar');
        await comment.populate('mentions.userId', 'name email avatar');
        res.json(comment);
    }
    catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Failed to update comment' });
    }
};
exports.updateComment = updateComment;
// Delete a comment (soft delete)
const deleteComment = async (req, res) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const comment = await Comment_js_1.default.findOne({
            _id: commentId,
            authorId: user._id,
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        await comment.save();
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};
exports.deleteComment = deleteComment;
// Add reaction to comment
const addReaction = async (req, res) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const { emoji } = req.body;
        const comment = await Comment_js_1.default.findById(commentId);
        if (!comment || comment.isDeleted) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // Find or create reaction
        let reaction = comment.reactions.find((r) => r.emoji === emoji);
        if (reaction) {
            // Toggle - if user already reacted, remove; otherwise add
            const userIndex = reaction.users.findIndex((u) => u.toString() === user._id.toString());
            if (userIndex >= 0) {
                reaction.users.splice(userIndex, 1);
                // Remove reaction if no users left
                if (reaction.users.length === 0) {
                    comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
                }
            }
            else {
                reaction.users.push(user._id);
            }
        }
        else {
            comment.reactions.push({
                emoji,
                users: [user._id],
            });
        }
        await comment.save();
        await comment.populate('authorId', 'name email avatar');
        res.json(comment);
    }
    catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ message: 'Failed to add reaction' });
    }
};
exports.addReaction = addReaction;
// Search mentionable users
const searchMentionableUsers = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { query } = req.query;
        // Get the task to find project members
        const task = await Task_js_1.Task.findById(taskId).populate('projectId');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const searchRegex = new RegExp(query, 'i');
        // Search users (in a real app, you'd want to limit to project members)
        const users = await User_js_1.User.find({
            $or: [{ name: searchRegex }, { email: searchRegex }, { username: searchRegex }],
            isActive: { $ne: false },
        })
            .select('_id name email avatar username')
            .limit(10);
        res.json(users);
    }
    catch (error) {
        console.error('Search mentionable users error:', error);
        res.status(500).json({ message: 'Failed to search users' });
    }
};
exports.searchMentionableUsers = searchMentionableUsers;
//# sourceMappingURL=commentController.js.map