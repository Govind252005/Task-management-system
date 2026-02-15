"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_js_1 = require("../controllers/reportController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get dashboard overview (role-based data)
router.get('/dashboard', reportController_js_1.getDashboardOverview);
// Get individual report (own report or team member's report for leads)
router.get('/individual/:userId?', reportController_js_1.getIndividualReport);
// Get team report (Team Lead and above)
router.get('/team/:managerId?', (0, auth_js_1.authorizeMinRole)('team_lead'), reportController_js_1.getTeamReport);
// Get project report (Manager and above)
router.get('/project/:projectId', (0, auth_js_1.authorizeMinRole)('manager'), reportController_js_1.getProjectReport);
// Get department report (Manager and above)
router.get('/department/:department?', (0, auth_js_1.authorizeMinRole)('manager'), reportController_js_1.getDepartmentReport);
// Get organization report (Admin only)
router.get('/organization', (0, auth_js_1.authorize)('admin'), reportController_js_1.getOrganizationReport);
// Get saved reports
router.get('/saved', reportController_js_1.getSavedReports);
// Save a report
router.post('/save', reportController_js_1.saveNewReport);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map