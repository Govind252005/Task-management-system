"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_js_1 = require("../controllers/userController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get all users
router.get('/', userController_js_1.getAllUsers);
// Get team members (for managers/team leads)
router.get('/team', (0, auth_js_1.authorizeMinRole)('team_lead'), userController_js_1.getTeamMembers);
// Get users by department
router.get('/department/:department', userController_js_1.getUsersByDepartment);
// Get user by ID
router.get('/:id', userController_js_1.getUserById);
// Create user (Admin or Manager)
router.post('/', (0, auth_js_1.authorizeMinRole)('manager'), userController_js_1.createUser);
// Update user (Admin or manager)
router.put('/:id', (0, auth_js_1.authorizeMinRole)('manager'), userController_js_1.updateUser);
// Delete user (Admin only)
router.delete('/:id', (0, auth_js_1.authorize)('admin'), userController_js_1.deleteUser);
// Assign team member (Manager and above)
router.post('/assign-team', (0, auth_js_1.authorizeMinRole)('manager'), userController_js_1.assignTeamMember);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map