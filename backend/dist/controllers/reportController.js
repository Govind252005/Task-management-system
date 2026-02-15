"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveNewReport = exports.getSavedReports = exports.getOrganizationReport = exports.getDepartmentReport = exports.getProjectReport = exports.getTeamReport = exports.getIndividualReport = exports.getDashboardOverview = void 0;
const reportService_js_1 = require("../services/reportService.js");
const Report_js_1 = require("../models/Report.js");
const Task_js_1 = require("../models/Task.js");
const User_js_1 = require("../models/User.js");
const Project_js_1 = require("../models/Project.js");
const index_js_1 = require("../config/index.js");
// Get dashboard overview based on role
const getDashboardOverview = async (req, res) => {
    try {
        const currentUser = req.user;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange = {
            start: new Date(req.query.startDate || thirtyDaysAgo),
            end: new Date(req.query.endDate || now),
        };
        const dashboardData = await (0, reportService_js_1.getDashboardData)(currentUser, dateRange);
        const accessibleReports = await (0, reportService_js_1.getAccessibleReports)(currentUser);
        res.json({
            dashboardData,
            accessibleReports,
            userRole: currentUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
    }
};
exports.getDashboardOverview = getDashboardOverview;
// Generate individual report
const getIndividualReport = async (req, res) => {
    try {
        const currentUser = req.user;
        const userId = req.params.userId || currentUser._id.toString();
        // Check permissions
        const userRole = currentUser.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        if (userId !== currentUser._id.toString() && userLevel < index_js_1.ROLE_HIERARCHY.team_lead) {
            res.status(403).json({ message: 'Access denied. Cannot view other users\' reports.' });
            return;
        }
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange = {
            start: new Date(req.query.startDate || thirtyDaysAgo),
            end: new Date(req.query.endDate || now),
        };
        const data = await (0, reportService_js_1.generateIndividualReport)(userId, dateRange);
        const user = await User_js_1.User.findById(userId).select('name email avatar role department');
        res.json({
            reportType: 'individual',
            user,
            dateRange,
            data,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};
exports.getIndividualReport = getIndividualReport;
// Generate team report (Team Lead and above)
const getTeamReport = async (req, res) => {
    try {
        const currentUser = req.user;
        const managerId = req.params.managerId || currentUser._id.toString();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange = {
            start: new Date(req.query.startDate || thirtyDaysAgo),
            end: new Date(req.query.endDate || now),
        };
        const data = await (0, reportService_js_1.generateTeamReport)(managerId, dateRange);
        const teamMembers = await User_js_1.User.find({ managerId }).select('name email avatar role');
        res.json({
            reportType: 'team',
            managerId,
            teamMembers,
            dateRange,
            data,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating team report', error: error.message });
    }
};
exports.getTeamReport = getTeamReport;
// Generate project report
const getProjectReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange = {
            start: new Date(req.query.startDate || thirtyDaysAgo),
            end: new Date(req.query.endDate || now),
        };
        const data = await (0, reportService_js_1.generateProjectReport)(projectId, dateRange);
        const project = await Project_js_1.Project.findById(projectId)
            .populate('members', 'name email avatar')
            .populate('teamLeadId', 'name email avatar');
        res.json({
            reportType: 'project',
            project,
            dateRange,
            data,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating project report', error: error.message });
    }
};
exports.getProjectReport = getProjectReport;
// Generate department report (Manager and above)
const getDepartmentReport = async (req, res) => {
    try {
        const department = req.params.department || req.user.department;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange = {
            start: new Date(req.query.startDate || thirtyDaysAgo),
            end: new Date(req.query.endDate || now),
        };
        const data = await (0, reportService_js_1.generateDepartmentReport)(department, dateRange);
        const departmentUsers = await User_js_1.User.find({ department }).select('name email avatar role');
        res.json({
            reportType: 'department',
            department,
            users: departmentUsers,
            dateRange,
            data,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating department report', error: error.message });
    }
};
exports.getDepartmentReport = getDepartmentReport;
// Generate organization report (Admin only)
const getOrganizationReport = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateRange = {
            start: new Date(req.query.startDate || thirtyDaysAgo),
            end: new Date(req.query.endDate || now),
        };
        const data = await (0, reportService_js_1.generateOrganizationReport)(dateRange);
        // Get overall stats
        const totalUsers = await User_js_1.User.countDocuments({ isActive: true });
        const totalProjects = await Project_js_1.Project.countDocuments();
        const totalTasks = await Task_js_1.Task.countDocuments();
        res.json({
            reportType: 'organization',
            dateRange,
            data,
            overview: {
                totalUsers,
                totalProjects,
                totalTasks,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating organization report', error: error.message });
    }
};
exports.getOrganizationReport = getOrganizationReport;
// Get saved reports
const getSavedReports = async (req, res) => {
    try {
        const currentUser = req.user;
        const { reportType, limit = 10 } = req.query;
        let query = { userId: currentUser._id };
        if (reportType)
            query.reportType = reportType;
        const reports = await Report_js_1.Report.find(query)
            .sort({ generatedAt: -1 })
            .limit(parseInt(limit));
        res.json({ reports });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};
exports.getSavedReports = getSavedReports;
// Save a report
const saveNewReport = async (req, res) => {
    try {
        const currentUser = req.user;
        const { reportType, targetId, dateRange, data, charts } = req.body;
        const report = await (0, reportService_js_1.saveReport)(currentUser._id.toString(), reportType, targetId, dateRange, data, charts);
        res.status(201).json({
            message: 'Report saved successfully',
            report,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving report', error: error.message });
    }
};
exports.saveNewReport = saveNewReport;
//# sourceMappingURL=reportController.js.map