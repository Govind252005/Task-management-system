"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = exports.getAccessibleReports = exports.saveReport = exports.generateDailyProgress = exports.generateOrganizationReport = exports.generateDepartmentReport = exports.generateProjectReport = exports.generateTeamReport = exports.generateIndividualReport = void 0;
const Report_js_1 = require("../models/Report.js");
const Task_js_1 = require("../models/Task.js");
const User_js_1 = require("../models/User.js");
const index_js_1 = require("../config/index.js");
// Generate individual report
const generateIndividualReport = async (userId, dateRange) => {
    const tasks = await Task_js_1.Task.find({
        assignees: userId,
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
    });
    const completedTasks = tasks.filter(t => t.status === 'done');
    const projectIds = [...new Set(tasks.map(t => t.projectId.toString()))];
    const data = {
        tasksCompleted: completedTasks.length,
        tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
        tasksTodo: tasks.filter(t => t.status === 'todo').length,
        tasksInReview: tasks.filter(t => t.status === 'review').length,
        totalHoursLogged: tasks.reduce((acc, t) => acc + t.timeLogged, 0),
        totalHoursEstimated: tasks.reduce((acc, t) => acc + t.timeEstimate, 0),
        projectsContributed: projectIds.length,
        averageTaskCompletionTime: completedTasks.length > 0
            ? completedTasks.reduce((acc, t) => acc + t.timeLogged, 0) / completedTasks.length
            : 0,
        overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
        tasksByPriority: {
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length,
        },
    };
    return data;
};
exports.generateIndividualReport = generateIndividualReport;
// Generate team report
const generateTeamReport = async (managerId, dateRange) => {
    const manager = await User_js_1.User.findById(managerId);
    if (!manager)
        throw new Error('Manager not found');
    const teamMembers = await User_js_1.User.find({ managerId: managerId });
    const teamMemberIds = teamMembers.map(m => m._id.toString());
    teamMemberIds.push(managerId); // Include manager
    const tasks = await Task_js_1.Task.find({
        assignees: { $in: teamMemberIds },
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
    });
    const completedTasks = tasks.filter(t => t.status === 'done');
    const projectIds = [...new Set(tasks.map(t => t.projectId.toString()))];
    const data = {
        tasksCompleted: completedTasks.length,
        tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
        tasksTodo: tasks.filter(t => t.status === 'todo').length,
        tasksInReview: tasks.filter(t => t.status === 'review').length,
        totalHoursLogged: tasks.reduce((acc, t) => acc + t.timeLogged, 0),
        totalHoursEstimated: tasks.reduce((acc, t) => acc + t.timeEstimate, 0),
        projectsContributed: projectIds.length,
        averageTaskCompletionTime: completedTasks.length > 0
            ? completedTasks.reduce((acc, t) => acc + t.timeLogged, 0) / completedTasks.length
            : 0,
        overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
        tasksByPriority: {
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length,
        },
    };
    return data;
};
exports.generateTeamReport = generateTeamReport;
// Generate project report
const generateProjectReport = async (projectId, dateRange) => {
    const tasks = await Task_js_1.Task.find({
        projectId,
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
    });
    const completedTasks = tasks.filter(t => t.status === 'done');
    const data = {
        tasksCompleted: completedTasks.length,
        tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
        tasksTodo: tasks.filter(t => t.status === 'todo').length,
        tasksInReview: tasks.filter(t => t.status === 'review').length,
        totalHoursLogged: tasks.reduce((acc, t) => acc + t.timeLogged, 0),
        totalHoursEstimated: tasks.reduce((acc, t) => acc + t.timeEstimate, 0),
        projectsContributed: 1,
        averageTaskCompletionTime: completedTasks.length > 0
            ? completedTasks.reduce((acc, t) => acc + t.timeLogged, 0) / completedTasks.length
            : 0,
        overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
        tasksByPriority: {
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length,
        },
    };
    return data;
};
exports.generateProjectReport = generateProjectReport;
// Generate department report
const generateDepartmentReport = async (department, dateRange) => {
    const departmentUsers = await User_js_1.User.find({ department });
    const userIds = departmentUsers.map(u => u._id.toString());
    const tasks = await Task_js_1.Task.find({
        assignees: { $in: userIds },
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
    });
    const completedTasks = tasks.filter(t => t.status === 'done');
    const projectIds = [...new Set(tasks.map(t => t.projectId.toString()))];
    const data = {
        tasksCompleted: completedTasks.length,
        tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
        tasksTodo: tasks.filter(t => t.status === 'todo').length,
        tasksInReview: tasks.filter(t => t.status === 'review').length,
        totalHoursLogged: tasks.reduce((acc, t) => acc + t.timeLogged, 0),
        totalHoursEstimated: tasks.reduce((acc, t) => acc + t.timeEstimate, 0),
        projectsContributed: projectIds.length,
        averageTaskCompletionTime: completedTasks.length > 0
            ? completedTasks.reduce((acc, t) => acc + t.timeLogged, 0) / completedTasks.length
            : 0,
        overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
        tasksByPriority: {
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length,
        },
    };
    return data;
};
exports.generateDepartmentReport = generateDepartmentReport;
// Generate organization-wide report (Admin only)
const generateOrganizationReport = async (dateRange) => {
    const tasks = await Task_js_1.Task.find({
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
    });
    const completedTasks = tasks.filter(t => t.status === 'done');
    const projectIds = [...new Set(tasks.map(t => t.projectId.toString()))];
    const data = {
        tasksCompleted: completedTasks.length,
        tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
        tasksTodo: tasks.filter(t => t.status === 'todo').length,
        tasksInReview: tasks.filter(t => t.status === 'review').length,
        totalHoursLogged: tasks.reduce((acc, t) => acc + t.timeLogged, 0),
        totalHoursEstimated: tasks.reduce((acc, t) => acc + t.timeEstimate, 0),
        projectsContributed: projectIds.length,
        averageTaskCompletionTime: completedTasks.length > 0
            ? completedTasks.reduce((acc, t) => acc + t.timeLogged, 0) / completedTasks.length
            : 0,
        overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
        tasksByPriority: {
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length,
        },
    };
    return data;
};
exports.generateOrganizationReport = generateOrganizationReport;
// Generate daily progress chart data
const generateDailyProgress = async (tasks, dateRange) => {
    const dailyProgress = [];
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        const completedOnDay = tasks.filter(t => t.status === 'done' &&
            new Date(t.updatedAt) >= dayStart &&
            new Date(t.updatedAt) <= dayEnd).length;
        dailyProgress.push({
            date: currentDate.toISOString().split('T')[0],
            completed: completedOnDay,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dailyProgress;
};
exports.generateDailyProgress = generateDailyProgress;
// Save report to database
const saveReport = async (userId, reportType, targetId, dateRange, data, charts) => {
    const report = new Report_js_1.Report({
        userId,
        reportType,
        targetId,
        generatedAt: new Date(),
        dateRange,
        data,
        charts,
    });
    await report.save();
    return report;
};
exports.saveReport = saveReport;
// Get reports based on user role
const getAccessibleReports = async (user) => {
    const role = user.role;
    const accessLevel = index_js_1.ROLE_HIERARCHY[role];
    const accessibleReports = ['individual'];
    if (accessLevel >= index_js_1.ROLE_HIERARCHY.team_lead) {
        accessibleReports.push('team');
    }
    if (accessLevel >= index_js_1.ROLE_HIERARCHY.manager) {
        accessibleReports.push('project', 'department');
    }
    if (accessLevel >= index_js_1.ROLE_HIERARCHY.admin) {
        accessibleReports.push('organization');
    }
    return accessibleReports;
};
exports.getAccessibleReports = getAccessibleReports;
// Get dashboard data based on user role
const getDashboardData = async (user, dateRange) => {
    const role = user.role;
    const accessLevel = index_js_1.ROLE_HIERARCHY[role];
    let data = {};
    // Individual metrics (available to all)
    data.individual = await (0, exports.generateIndividualReport)(user._id.toString(), dateRange);
    // Team metrics (team_lead and above)
    if (accessLevel >= index_js_1.ROLE_HIERARCHY.team_lead) {
        data.team = await (0, exports.generateTeamReport)(user._id.toString(), dateRange);
    }
    // Department metrics (manager and above)
    if (accessLevel >= index_js_1.ROLE_HIERARCHY.manager) {
        data.department = await (0, exports.generateDepartmentReport)(user.department, dateRange);
    }
    // Organization metrics (admin only)
    if (accessLevel >= index_js_1.ROLE_HIERARCHY.admin) {
        data.organization = await (0, exports.generateOrganizationReport)(dateRange);
    }
    return data;
};
exports.getDashboardData = getDashboardData;
//# sourceMappingURL=reportService.js.map