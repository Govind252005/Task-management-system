"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeTask = exports.generateTaskDescription = exports.getBurndownPrediction = exports.getProductivityInsights = exports.getScheduleSuggestions = exports.getTaskSuggestions = void 0;
const aiService_js_1 = __importDefault(require("../services/aiService.js"));
const Task_js_1 = require("../models/Task.js");
const Project_js_1 = require("../models/Project.js");
const Sprint_js_1 = require("../models/Sprint.js");
const TimeEntry_js_1 = __importDefault(require("../models/TimeEntry.js"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get AI task suggestions for a project
const getTaskSuggestions = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project_js_1.Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Get existing tasks
        const existingTasks = await Task_js_1.Task.find({ projectId })
            .select('title status')
            .limit(50);
        const suggestions = await aiService_js_1.default.suggestTasks({
            projectName: project.name,
            projectDescription: project.description || '',
            existingTasks: existingTasks.map((t) => ({
                title: t.title,
                status: t.status,
            })),
        });
        res.json(suggestions);
    }
    catch (error) {
        console.error('Get task suggestions error:', error);
        res.status(500).json({ message: 'Failed to get AI suggestions' });
    }
};
exports.getTaskSuggestions = getTaskSuggestions;
// Get smart scheduling suggestions
const getScheduleSuggestions = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sprintId } = req.query;
        const user = req.user;
        // Get unscheduled tasks
        const taskQuery = {
            projectId,
            status: { $nin: ['done', 'closed'] },
        };
        if (sprintId) {
            taskQuery.sprintId = sprintId;
        }
        const tasks = await Task_js_1.Task.find(taskQuery)
            .select('_id title priority estimatedHours dependencies')
            .limit(20);
        if (tasks.length === 0) {
            return res.json([]);
        }
        // Get team members and their workload
        const project = await Project_js_1.Project.findById(projectId).populate('members', '_id name');
        const members = project?.members || [];
        const memberWorkloads = await Promise.all(members.map(async (member) => {
            // Simplified workload calculation
            const timeEntries = await TimeEntry_js_1.default.find({
                userId: member._id,
                startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            });
            const totalTime = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
            return {
                id: member._id.toString(),
                name: member.name,
                currentWorkload: Math.round(totalTime / 3600), // Convert to hours
            };
        }));
        // Get sprint end date if applicable
        let sprintEndDate;
        if (sprintId) {
            const sprint = await Sprint_js_1.Sprint.findById(sprintId);
            sprintEndDate = sprint?.endDate;
        }
        const suggestions = await aiService_js_1.default.suggestSmartSchedule({
            tasks: tasks.map((t) => ({
                id: t._id.toString(),
                title: t.title,
                priority: t.priority,
                estimatedHours: t.estimatedHours,
                dependencies: t.dependencies?.map((d) => d.toString()),
            })),
            teamMembers: memberWorkloads,
            sprintEndDate,
        });
        res.json(suggestions);
    }
    catch (error) {
        console.error('Get schedule suggestions error:', error);
        res.status(500).json({ message: 'Failed to get scheduling suggestions' });
    }
};
exports.getScheduleSuggestions = getScheduleSuggestions;
// Get productivity insights for user
const getProductivityInsights = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const user = req.user;
        const start = startDate
            ? new Date(startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
        const end = endDate ? new Date(endDate) : new Date();
        // Get user's completed tasks in time range
        const completedTasks = await Task_js_1.Task.find({
            assignees: user._id,
            status: 'done',
            completedAt: { $gte: start, $lte: end },
        });
        const createdTasks = await Task_js_1.Task.countDocuments({
            createdBy: user._id,
            createdAt: { $gte: start, $lte: end },
        });
        // Calculate average completion time
        const tasksWithTimes = completedTasks.filter((t) => t.createdAt && t.completedAt);
        const avgCompletionTime = tasksWithTimes.length > 0
            ? tasksWithTimes.reduce((sum, t) => sum +
                (t.completedAt.getTime() - t.createdAt.getTime()) /
                    (1000 * 60 * 60), 0) / tasksWithTimes.length
            : 0;
        // On-time completion rate
        const onTimeTasks = completedTasks.filter((t) => !t.dueDate || t.completedAt <= t.dueDate);
        const onTimeRate = completedTasks.length > 0
            ? (onTimeTasks.length / completedTasks.length) * 100
            : 100;
        // Get time entries for daily activity
        const timeEntries = await TimeEntry_js_1.default.find({
            userId: user._id,
            startTime: { $gte: start, $lte: end },
        });
        // Group by date
        const dailyActivityMap = new Map();
        for (const entry of timeEntries) {
            const dateKey = entry.startTime.toISOString().split('T')[0];
            const existing = dailyActivityMap.get(dateKey) || { tasksCompleted: 0, hoursWorked: 0 };
            existing.hoursWorked += (entry.duration || 0) / 3600;
            dailyActivityMap.set(dateKey, existing);
        }
        for (const task of completedTasks) {
            if (task.completedAt) {
                const dateKey = task.completedAt.toISOString().split('T')[0];
                const existing = dailyActivityMap.get(dateKey) || { tasksCompleted: 0, hoursWorked: 0 };
                existing.tasksCompleted += 1;
                dailyActivityMap.set(dateKey, existing);
            }
        }
        const dailyActivity = Array.from(dailyActivityMap.entries()).map(([date, data]) => ({
            date: new Date(date),
            ...data,
        }));
        const insights = await aiService_js_1.default.analyzeProductivity({
            userId: user._id.toString(),
            userName: user.name,
            timeRange: { start, end },
            tasksCompleted: completedTasks.length,
            tasksCreated: createdTasks,
            averageCompletionTime: avgCompletionTime,
            onTimeCompletionRate: onTimeRate,
            dailyActivity,
        });
        res.json({
            insights,
            rawMetrics: {
                tasksCompleted: completedTasks.length,
                tasksCreated: createdTasks,
                averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
                onTimeCompletionRate: Math.round(onTimeRate * 100) / 100,
            },
        });
    }
    catch (error) {
        console.error('Get productivity insights error:', error);
        res.status(500).json({ message: 'Failed to get productivity insights' });
    }
};
exports.getProductivityInsights = getProductivityInsights;
// Predict burndown for sprint
const getBurndownPrediction = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const sprint = await Sprint_js_1.Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }
        // Get tasks in sprint
        const tasks = await Task_js_1.Task.find({ sprintId });
        const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedPoints = tasks
            .filter((t) => t.status === 'done')
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        // Get daily burndown data (simplified - in production, you'd track this over time)
        const daysElapsed = Math.ceil((new Date().getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const dailyBurndown = [];
        // Create simulated daily burndown (in production, this would be stored data)
        const pointsPerDay = daysElapsed > 0 ? completedPoints / daysElapsed : 0;
        for (let i = 0; i <= daysElapsed; i++) {
            const date = new Date(sprint.startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const simulatedCompleted = Math.min(Math.round(pointsPerDay * i), completedPoints);
            dailyBurndown.push({
                date,
                remainingPoints: totalPoints - simulatedCompleted,
            });
        }
        const sprintDays = Math.ceil((sprint.endDate.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const avgVelocity = daysElapsed > 0 ? completedPoints / daysElapsed : 0;
        const prediction = await aiService_js_1.default.predictBurndown({
            sprintName: sprint.name,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            totalPoints,
            completedPoints,
            dailyBurndown,
            teamVelocity: avgVelocity,
        });
        res.json({
            prediction,
            currentStats: {
                totalPoints,
                completedPoints,
                remainingPoints: totalPoints - completedPoints,
                daysElapsed,
                daysRemaining: Math.max(0, sprintDays - daysElapsed),
                currentVelocity: Math.round(avgVelocity * 100) / 100,
            },
            burndownData: dailyBurndown,
        });
    }
    catch (error) {
        console.error('Get burndown prediction error:', error);
        res.status(500).json({ message: 'Failed to get burndown prediction' });
    }
};
exports.getBurndownPrediction = getBurndownPrediction;
// Generate task description using AI
const generateTaskDescription = async (req, res) => {
    try {
        const { title, projectId, additionalInfo } = req.body;
        let projectContext;
        if (projectId) {
            const project = await Project_js_1.Project.findById(projectId);
            if (project) {
                projectContext = `${project.name}: ${project.description || ''}`;
            }
        }
        const description = await aiService_js_1.default.generateTaskDescription({
            title,
            projectContext,
            additionalInfo,
        });
        res.json({ description });
    }
    catch (error) {
        console.error('Generate task description error:', error);
        res.status(500).json({ message: 'Failed to generate description' });
    }
};
exports.generateTaskDescription = generateTaskDescription;
// Auto-categorize task
const categorizeTask = async (req, res) => {
    try {
        const { title, description, projectId } = req.body;
        // Get available labels for the project
        const Label = mongoose_1.default.model('Label');
        const labels = await Label.find({
            $or: [{ projectId }, { projectId: { $exists: false } }],
        }).select('name');
        if (labels.length === 0) {
            return res.json({ labels: [] });
        }
        const suggestedLabels = await aiService_js_1.default.categorizeTask({
            title,
            description,
            availableLabels: labels.map((l) => l.name),
        });
        // Map label names back to IDs
        const matchedLabels = labels.filter((l) => suggestedLabels.some((sl) => sl.toLowerCase() === l.name.toLowerCase()));
        res.json({
            labels: matchedLabels,
            suggestions: suggestedLabels,
        });
    }
    catch (error) {
        console.error('Categorize task error:', error);
        res.status(500).json({ message: 'Failed to categorize task' });
    }
};
exports.categorizeTask = categorizeTask;
//# sourceMappingURL=aiController.js.map