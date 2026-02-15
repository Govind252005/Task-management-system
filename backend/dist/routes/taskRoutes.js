"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_js_1 = require("../controllers/taskController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get all tasks (with filtering)
router.get('/', taskController_js_1.getAllTasks);
// Get my tasks
router.get('/my-tasks', taskController_js_1.getMyTasks);
// Get tasks by project
router.get('/project/:projectId', taskController_js_1.getTasksByProject);
// Get task by ID
router.get('/:id', taskController_js_1.getTaskById);
// Create new task
router.post('/', taskController_js_1.createTask);
// Update task
router.put('/:id', taskController_js_1.updateTask);
// Delete task
router.delete('/:id', taskController_js_1.deleteTask);
// Update task status
router.put('/:id/status', taskController_js_1.updateTaskStatus);
// Update task assignees
router.put('/:id/assignees', taskController_js_1.updateTaskAssignees);
// Add comment to task
router.post('/:id/comments', taskController_js_1.addComment);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map