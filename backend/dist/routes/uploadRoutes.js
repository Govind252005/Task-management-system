"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_js_1 = require("../controllers/uploadController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Upload file to task
router.post('/tasks/:taskId', uploadController_js_1.upload.single('file'), uploadController_js_1.uploadFile);
// Get attachments for a task
router.get('/tasks/:taskId', uploadController_js_1.getTaskAttachments);
// Delete attachment
router.delete('/:id', uploadController_js_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map