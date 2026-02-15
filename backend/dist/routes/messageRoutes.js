"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const messageController_js_1 = require("../controllers/messageController.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.get('/conversations', messageController_js_1.getConversations);
router.post('/conversations', messageController_js_1.createConversation);
router.get('/conversations/:conversationId/messages', messageController_js_1.getMessages);
router.post('/conversations/:conversationId/messages', messageController_js_1.sendMessage);
router.post('/conversations/:conversationId/read', messageController_js_1.markConversationRead);
router.post('/tasks/:taskId/group', messageController_js_1.createTaskGroupConversation);
// Direct message actions (mounted under /messages)
router.put('/:messageId', messageController_js_1.updateMessage);
router.delete('/:messageId', messageController_js_1.deleteMessage);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map