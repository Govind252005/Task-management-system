"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_js_1 = require("../controllers/notificationController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get notifications
router.get('/', notificationController_js_1.getNotifications);
// Get unread count
router.get('/unread-count', notificationController_js_1.getUnreadNotificationCount);
// Mark notification as read
router.put('/:id/read', notificationController_js_1.markAsRead);
// Mark all notifications as read
router.put('/read-all', notificationController_js_1.markAllAsRead);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map