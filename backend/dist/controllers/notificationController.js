"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadNotificationCount = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const notificationService_js_1 = require("../services/notificationService.js");
// Get user notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const limit = parseInt(req.query.limit) || 20;
        const notifications = await (0, notificationService_js_1.getUserNotifications)(userId, limit);
        const unreadCount = await (0, notificationService_js_1.getUnreadCount)(userId);
        res.json({
            data: notifications,
            unreadCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};
exports.getNotifications = getNotifications;
// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id.toString();
        const notification = await (0, notificationService_js_1.markNotificationRead)(id, userId);
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({
            message: 'Notification marked as read',
            notification,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        await (0, notificationService_js_1.markAllNotificationsRead)(userId);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
// Get unread notification count
const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const count = await (0, notificationService_js_1.getUnreadCount)(userId);
        res.json({ unreadCount: count });
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting unread count', error: error.message });
    }
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
//# sourceMappingURL=notificationController.js.map