"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sprintController_js_1 = require("../controllers/sprintController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get all sprints
router.get('/', sprintController_js_1.getAllSprints);
// Get sprint by ID
router.get('/:id', sprintController_js_1.getSprintById);
// Get tasks in sprint
router.get('/:id/tasks', sprintController_js_1.getSprintTasks);
// Create new sprint (Team Lead and above)
router.post('/', (0, auth_js_1.authorizeMinRole)('team_lead'), sprintController_js_1.createSprint);
// Update sprint (Team Lead and above)
router.put('/:id', (0, auth_js_1.authorizeMinRole)('team_lead'), sprintController_js_1.updateSprint);
// Delete sprint (Manager and above)
router.delete('/:id', (0, auth_js_1.authorizeMinRole)('manager'), sprintController_js_1.deleteSprint);
exports.default = router;
//# sourceMappingURL=sprintRoutes.js.map