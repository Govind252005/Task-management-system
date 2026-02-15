"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.createGenericNotification = exports.getUnreadCount = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUserNotifications = exports.notifyComment = exports.notifyTaskStatusChange = exports.notifyTaskAssignment = exports.createNotification = void 0;
const Notification_js_1 = require("../models/Notification.js");
const User_js_1 = require("../models/User.js");
const Project_js_1 = require("../models/Project.js");
const emailService_js_1 = require("./emailService.js");
const socketService_js_1 = require("./socketService.js");
// Create notification
const createNotification = async (payload) => {
    const notification = new Notification_js_1.Notification({
        userId: payload.userId,
        fromUserId: payload.fromUserId,
        action: payload.action,
        target: payload.target,
        targetType: payload.targetType,
        taskId: payload.taskId || null,
        projectId: payload.projectId || null,
        read: false,
        emailSent: false,
    });
    await notification.save();
    try {
        const fromUser = await User_js_1.User.findById(payload.fromUserId).select('name avatar');
        const message = `${fromUser?.name || 'Someone'} ${payload.action}`;
        const title = payload.targetType === 'project'
            ? 'Project update'
            : payload.targetType === 'task'
                ? 'Task update'
                : 'Notification';
        (0, socketService_js_1.emitToUser)(payload.userId.toString(), 'notification:new', {
            _id: notification._id.toString(),
            type: payload.targetType,
            title,
            message,
            read: false,
            createdAt: notification.createdAt || new Date(),
            data: {
                target: payload.target,
                targetType: payload.targetType,
                taskId: payload.taskId,
                projectId: payload.projectId,
                fromUser: fromUser ? { id: fromUser._id, name: fromUser.name, avatar: fromUser.avatar } : null,
            },
        });
    }
    catch (err) {
        console.error('Failed to emit notification via socket:', err);
    }
    return notification;
};
exports.createNotification = createNotification;
// Notify assignees when a task is assigned
const notifyTaskAssignment = async (task, newAssignees, assignedBy) => {
    const project = await Project_js_1.Project.findById(task.projectId);
    const projectName = project?.name || 'Unknown Project';
    for (const assigneeId of newAssignees) {
        const assignee = await User_js_1.User.findById(assigneeId);
        if (!assignee || assignee._id.toString() === assignedBy._id.toString())
            continue;
        // Create in-app notification
        await (0, exports.createNotification)({
            userId: assigneeId,
            fromUserId: assignedBy._id.toString(),
            action: `assigned you to "${task.title}"`,
            target: task.code,
            targetType: 'task',
            taskId: task._id.toString(),
            projectId: task.projectId?.toString(),
        });
        // Send email notification
        const emailSent = await (0, emailService_js_1.sendTaskAssignmentEmail)(assignee, task, assignedBy, projectName);
        if (emailSent) {
            await Notification_js_1.Notification.findOneAndUpdate({ userId: assigneeId, taskId: task._id, action: { $regex: /assigned you/ } }, { emailSent: true });
        }
    }
};
exports.notifyTaskAssignment = notifyTaskAssignment;
// Notify when task status changes
const notifyTaskStatusChange = async (task, updatedBy, oldStatus, newStatus) => {
    const statusLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        review: 'Review',
        done: 'Done',
    };
    // Notify all assignees
    for (const assigneeId of task.assignees) {
        if (assigneeId.toString() === updatedBy._id.toString())
            continue;
        const assignee = await User_js_1.User.findById(assigneeId);
        if (!assignee)
            continue;
        await (0, exports.createNotification)({
            userId: assigneeId.toString(),
            fromUserId: updatedBy._id.toString(),
            action: `changed status to "${statusLabels[newStatus]}"`,
            target: task.code,
            targetType: 'task',
            taskId: task._id.toString(),
            projectId: task.projectId?.toString(),
        });
        await (0, emailService_js_1.sendTaskUpdateEmail)(assignee, task, updatedBy, 'Status Changed', statusLabels[oldStatus], statusLabels[newStatus]);
    }
    // Also notify the reporter if different
    if (task.reporter.toString() !== updatedBy._id.toString() && !task.assignees.includes(task.reporter)) {
        const reporter = await User_js_1.User.findById(task.reporter);
        if (reporter) {
            await (0, exports.createNotification)({
                userId: task.reporter.toString(),
                fromUserId: updatedBy._id.toString(),
                action: `changed status to "${statusLabels[newStatus]}"`,
                target: task.code,
                targetType: 'task',
                taskId: task._id.toString(),
                projectId: task.projectId?.toString(),
            });
            await (0, emailService_js_1.sendTaskUpdateEmail)(reporter, task, updatedBy, 'Status Changed', statusLabels[oldStatus], statusLabels[newStatus]);
        }
    }
};
exports.notifyTaskStatusChange = notifyTaskStatusChange;
// Notify when a comment is added
const notifyComment = async (task, commenter, comment) => {
    const notifiedUsers = new Set();
    // Notify all assignees
    for (const assigneeId of task.assignees) {
        if (assigneeId.toString() === commenter._id.toString())
            continue;
        if (notifiedUsers.has(assigneeId.toString()))
            continue;
        const assignee = await User_js_1.User.findById(assigneeId);
        if (!assignee)
            continue;
        await (0, exports.createNotification)({
            userId: assigneeId.toString(),
            fromUserId: commenter._id.toString(),
            action: `commented on "${task.title}"`,
            target: task.code,
            targetType: 'comment',
            taskId: task._id.toString(),
            projectId: task.projectId?.toString(),
        });
        await (0, emailService_js_1.sendCommentNotificationEmail)(assignee, task, commenter, comment);
        notifiedUsers.add(assigneeId.toString());
    }
    // Notify reporter if not already notified
    if (task.reporter.toString() !== commenter._id.toString() && !notifiedUsers.has(task.reporter.toString())) {
        const reporter = await User_js_1.User.findById(task.reporter);
        if (reporter) {
            await (0, exports.createNotification)({
                userId: task.reporter.toString(),
                fromUserId: commenter._id.toString(),
                action: `commented on "${task.title}"`,
                target: task.code,
                targetType: 'comment',
                taskId: task._id.toString(),
                projectId: task.projectId?.toString(),
            });
            await (0, emailService_js_1.sendCommentNotificationEmail)(reporter, task, commenter, comment);
        }
    }
};
exports.notifyComment = notifyComment;
// Get user notifications
const getUserNotifications = async (userId, limit = 20) => {
    return Notification_js_1.Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('fromUserId', 'name avatar');
};
exports.getUserNotifications = getUserNotifications;
// Mark notification as read
const markNotificationRead = async (notificationId, userId) => {
    return Notification_js_1.Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true }, { new: true });
};
exports.markNotificationRead = markNotificationRead;
// Mark all notifications as read
const markAllNotificationsRead = async (userId) => {
    await Notification_js_1.Notification.updateMany({ userId, read: false }, { read: true });
};
exports.markAllNotificationsRead = markAllNotificationsRead;
// Get unread notification count
const getUnreadCount = async (userId) => {
    return Notification_js_1.Notification.countDocuments({ userId, read: false });
};
exports.getUnreadCount = getUnreadCount;
const createGenericNotification = async (payload) => {
    const notification = new Notification_js_1.Notification({
        userId: payload.userId,
        action: payload.type,
        target: payload.title,
        targetType: payload.relatedEntity?.type || 'task',
        taskId: payload.relatedEntity?.type === 'task' ? payload.relatedEntity.id : null,
        projectId: payload.relatedEntity?.type === 'project' ? payload.relatedEntity.id : null,
        read: false,
        emailSent: false,
    });
    await notification.save();
    try {
        (0, socketService_js_1.emitToUser)(payload.userId.toString(), 'notification:new', {
            _id: notification._id.toString(),
            type: payload.type,
            title: payload.title,
            message: payload.message,
            read: false,
            createdAt: notification.createdAt || new Date(),
            data: payload.relatedEntity,
        });
    }
    catch (err) {
        console.error('Failed to emit generic notification via socket:', err);
    }
    return notification;
};
exports.createGenericNotification = createGenericNotification;
// Wrapper object for backwards compatibility
exports.notificationService = {
    createNotification: exports.createGenericNotification,
    notifyTaskAssignment: exports.notifyTaskAssignment,
    notifyTaskStatusChange: exports.notifyTaskStatusChange,
    notifyComment: exports.notifyComment,
    getUserNotifications: exports.getUserNotifications,
    markNotificationRead: exports.markNotificationRead,
    markAllNotificationsRead: exports.markAllNotificationsRead,
    getUnreadCount: exports.getUnreadCount,
};
exports.default = exports.notificationService;
//# sourceMappingURL=notificationService.js.map