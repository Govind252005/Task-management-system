"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activityController_js_1 = require("../controllers/activityController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get recent activities
router.get('/', activityController_js_1.getActivities);
// Get activities by project
router.get('/project/:projectId', activityController_js_1.getProjectActivities);
// Get user activities
router.get('/user/:userId', activityController_js_1.getUserActivities);
exports.default = router;
//# sourceMappingURL=activityRoutes.js.map