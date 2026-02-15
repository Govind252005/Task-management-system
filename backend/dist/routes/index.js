"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_js_1 = __importDefault(require("./authRoutes.js"));
const userRoutes_js_1 = __importDefault(require("./userRoutes.js"));
const taskRoutes_js_1 = __importDefault(require("./taskRoutes.js"));
const projectRoutes_js_1 = __importDefault(require("./projectRoutes.js"));
const sprintRoutes_js_1 = __importDefault(require("./sprintRoutes.js"));
const notificationRoutes_js_1 = __importDefault(require("./notificationRoutes.js"));
const reportRoutes_js_1 = __importDefault(require("./reportRoutes.js"));
const activityRoutes_js_1 = __importDefault(require("./activityRoutes.js"));
const labelRoutes_js_1 = __importDefault(require("./labelRoutes.js"));
const searchRoutes_js_1 = __importDefault(require("./searchRoutes.js"));
const uploadRoutes_js_1 = __importDefault(require("./uploadRoutes.js"));
// New route imports
const checklistRoutes_js_1 = __importDefault(require("./checklistRoutes.js"));
const timeEntryRoutes_js_1 = __importDefault(require("./timeEntryRoutes.js"));
const commentRoutes_js_1 = __importDefault(require("./commentRoutes.js"));
const aiRoutes_js_1 = __importDefault(require("./aiRoutes.js"));
const twoFactorRoutes_js_1 = __importDefault(require("./twoFactorRoutes.js"));
const integrationRoutes_js_1 = __importDefault(require("./integrationRoutes.js"));
const messageRoutes_js_1 = __importDefault(require("./messageRoutes.js"));
const router = (0, express_1.Router)();
// API Routes
router.use('/auth', authRoutes_js_1.default);
router.use('/users', userRoutes_js_1.default);
router.use('/tasks', taskRoutes_js_1.default);
router.use('/projects', projectRoutes_js_1.default);
router.use('/sprints', sprintRoutes_js_1.default);
router.use('/notifications', notificationRoutes_js_1.default);
router.use('/reports', reportRoutes_js_1.default);
router.use('/activities', activityRoutes_js_1.default);
router.use('/labels', labelRoutes_js_1.default);
router.use('/search', searchRoutes_js_1.default);
router.use('/uploads', uploadRoutes_js_1.default);
// New routes
router.use('/checklists', checklistRoutes_js_1.default);
router.use('/time-entries', timeEntryRoutes_js_1.default);
router.use('/comments', commentRoutes_js_1.default);
router.use('/ai', aiRoutes_js_1.default);
router.use('/2fa', twoFactorRoutes_js_1.default);
router.use('/integrations', integrationRoutes_js_1.default);
router.use('/messages', messageRoutes_js_1.default);
// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map