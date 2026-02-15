"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_js_1 = require("../controllers/projectController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get all projects
router.get('/', projectController_js_1.getAllProjects);
// Get project by ID
router.get('/:id', projectController_js_1.getProjectById);
// Create new project
router.post('/', projectController_js_1.createProject);
// Update project
router.put('/:id', projectController_js_1.updateProject);
// Delete project (Manager and above)
router.delete('/:id', (0, auth_js_1.authorizeMinRole)('manager'), projectController_js_1.deleteProject);
// Get project members
router.get('/:id/members', projectController_js_1.getProjectMembers);
// Update project members
router.put('/:id/members', projectController_js_1.updateProjectMembers);
exports.default = router;
//# sourceMappingURL=projectRoutes.js.map