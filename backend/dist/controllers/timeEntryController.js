"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectTimeReport = exports.deleteTimeEntry = exports.updateTimeEntry = exports.createManualEntry = exports.getCurrentTimer = exports.stopTimer = exports.startTimer = exports.getUserTimeEntries = exports.getTaskTimeEntries = void 0;
const TimeEntry_js_1 = __importDefault(require("../models/TimeEntry.js"));
const Task_js_1 = require("../models/Task.js");
const mongoose_1 = __importDefault(require("mongoose"));
// Get time entries for a task
const getTaskTimeEntries = async (req, res) => {
    try {
        const { taskId } = req.params;
        const entries = await TimeEntry_js_1.default.find({ taskId })
            .populate('userId', 'name email avatar')
            .sort({ startTime: -1 });
        // Calculate total time
        const totalTime = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
        res.json({
            entries,
            totalSeconds: totalTime,
            totalHours: Math.round((totalTime / 3600) * 100) / 100,
        });
    }
    catch (error) {
        console.error('Get time entries error:', error);
        res.status(500).json({ message: 'Failed to fetch time entries' });
    }
};
exports.getTaskTimeEntries = getTaskTimeEntries;
// Get user's time entries
const getUserTimeEntries = async (req, res) => {
    try {
        const user = req.user;
        const { startDate, endDate, projectId } = req.query;
        const query = { userId: user._id };
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate)
                query.startTime.$gte = new Date(startDate);
            if (endDate)
                query.startTime.$lte = new Date(endDate);
        }
        if (projectId) {
            query.projectId = projectId;
        }
        const entries = await TimeEntry_js_1.default.find(query)
            .populate('taskId', 'title')
            .populate('projectId', 'name')
            .sort({ startTime: -1 });
        // Calculate totals
        const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
        const billableSeconds = entries
            .filter((e) => e.isBillable)
            .reduce((sum, e) => sum + (e.duration || 0), 0);
        res.json({
            entries,
            totalSeconds,
            totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
            billableSeconds,
            billableHours: Math.round((billableSeconds / 3600) * 100) / 100,
        });
    }
    catch (error) {
        console.error('Get user time entries error:', error);
        res.status(500).json({ message: 'Failed to fetch time entries' });
    }
};
exports.getUserTimeEntries = getUserTimeEntries;
// Start time tracking
const startTimer = async (req, res) => {
    try {
        const user = req.user;
        const { taskId, description, isBillable } = req.body;
        // Check if user already has a running timer
        const runningTimer = await TimeEntry_js_1.default.findOne({
            userId: user._id,
            isRunning: true,
        });
        if (runningTimer) {
            return res.status(400).json({
                message: 'You already have a running timer. Please stop it first.',
                runningEntry: runningTimer,
            });
        }
        // Get task for project reference
        const task = await Task_js_1.Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const entry = new TimeEntry_js_1.default({
            userId: user._id,
            taskId,
            projectId: task.projectId,
            description,
            startTime: new Date(),
            isRunning: true,
            isBillable: isBillable ?? false,
        });
        await entry.save();
        res.status(201).json(entry);
    }
    catch (error) {
        console.error('Start timer error:', error);
        res.status(500).json({ message: 'Failed to start timer' });
    }
};
exports.startTimer = startTimer;
// Stop time tracking
const stopTimer = async (req, res) => {
    try {
        const user = req.user;
        const { entryId } = req.params;
        const { endTime, description } = req.body;
        const entry = await TimeEntry_js_1.default.findOne({
            _id: entryId,
            userId: user._id,
            isRunning: true,
        });
        if (!entry) {
            return res.status(404).json({ message: 'Running timer not found' });
        }
        entry.endTime = endTime ? new Date(endTime) : new Date();
        entry.isRunning = false;
        entry.duration = Math.round((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
        if (description) {
            entry.description = description;
        }
        await entry.save();
        res.json(entry);
    }
    catch (error) {
        console.error('Stop timer error:', error);
        res.status(500).json({ message: 'Failed to stop timer' });
    }
};
exports.stopTimer = stopTimer;
// Get current running timer
const getCurrentTimer = async (req, res) => {
    try {
        const user = req.user;
        const entry = await TimeEntry_js_1.default.findOne({
            userId: user._id,
            isRunning: true,
        })
            .populate('taskId', 'title')
            .populate('projectId', 'name');
        if (!entry) {
            return res.json(null);
        }
        // Calculate current duration
        const currentDuration = Math.round((new Date().getTime() - entry.startTime.getTime()) / 1000);
        res.json({
            ...entry.toObject(),
            currentDuration,
        });
    }
    catch (error) {
        console.error('Get current timer error:', error);
        res.status(500).json({ message: 'Failed to get current timer' });
    }
};
exports.getCurrentTimer = getCurrentTimer;
// Create manual time entry
const createManualEntry = async (req, res) => {
    try {
        const user = req.user;
        const { taskId, description, startTime, endTime, duration, isBillable } = req.body;
        // Get task for project reference
        const task = await Task_js_1.Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        let calculatedDuration = duration;
        if (!calculatedDuration && startTime && endTime) {
            calculatedDuration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
        }
        const entry = new TimeEntry_js_1.default({
            userId: user._id,
            taskId,
            projectId: task.projectId,
            description,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : new Date(new Date(startTime).getTime() + (calculatedDuration * 1000)),
            duration: calculatedDuration,
            isRunning: false,
            isBillable: isBillable ?? false,
        });
        await entry.save();
        res.status(201).json(entry);
    }
    catch (error) {
        console.error('Create manual entry error:', error);
        res.status(500).json({ message: 'Failed to create time entry' });
    }
};
exports.createManualEntry = createManualEntry;
// Update time entry
const updateTimeEntry = async (req, res) => {
    try {
        const user = req.user;
        const { entryId } = req.params;
        const { description, startTime, endTime, duration, isBillable } = req.body;
        const entry = await TimeEntry_js_1.default.findOne({
            _id: entryId,
            userId: user._id,
        });
        if (!entry) {
            return res.status(404).json({ message: 'Time entry not found' });
        }
        if (description !== undefined)
            entry.description = description;
        if (startTime)
            entry.startTime = new Date(startTime);
        if (endTime)
            entry.endTime = new Date(endTime);
        if (isBillable !== undefined)
            entry.isBillable = isBillable;
        // Recalculate duration
        if ((startTime || endTime) && entry.endTime) {
            entry.duration = Math.round((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
        }
        else if (duration !== undefined) {
            entry.duration = duration;
        }
        await entry.save();
        res.json(entry);
    }
    catch (error) {
        console.error('Update time entry error:', error);
        res.status(500).json({ message: 'Failed to update time entry' });
    }
};
exports.updateTimeEntry = updateTimeEntry;
// Delete time entry
const deleteTimeEntry = async (req, res) => {
    try {
        const user = req.user;
        const { entryId } = req.params;
        const entry = await TimeEntry_js_1.default.findOneAndDelete({
            _id: entryId,
            userId: user._id,
        });
        if (!entry) {
            return res.status(404).json({ message: 'Time entry not found' });
        }
        res.json({ message: 'Time entry deleted successfully' });
    }
    catch (error) {
        console.error('Delete time entry error:', error);
        res.status(500).json({ message: 'Failed to delete time entry' });
    }
};
exports.deleteTimeEntry = deleteTimeEntry;
// Get time report for project
const getProjectTimeReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;
        const matchQuery = { projectId: new mongoose_1.default.Types.ObjectId(projectId) };
        if (startDate || endDate) {
            matchQuery.startTime = {};
            if (startDate)
                matchQuery.startTime.$gte = new Date(startDate);
            if (endDate)
                matchQuery.startTime.$lte = new Date(endDate);
        }
        const report = await TimeEntry_js_1.default.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        taskId: '$taskId',
                    },
                    totalSeconds: { $sum: '$duration' },
                    billableSeconds: {
                        $sum: { $cond: ['$isBillable', '$duration', 0] },
                    },
                    entries: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id.taskId',
                    foreignField: '_id',
                    as: 'task',
                },
            },
            {
                $project: {
                    user: { $arrayElemAt: ['$user', 0] },
                    task: { $arrayElemAt: ['$task', 0] },
                    totalSeconds: 1,
                    billableSeconds: 1,
                    entries: 1,
                },
            },
            {
                $group: {
                    _id: '$user._id',
                    userName: { $first: '$user.name' },
                    userEmail: { $first: '$user.email' },
                    totalSeconds: { $sum: '$totalSeconds' },
                    billableSeconds: { $sum: '$billableSeconds' },
                    entries: { $sum: '$entries' },
                    tasks: {
                        $push: {
                            taskId: '$task._id',
                            taskTitle: '$task.title',
                            seconds: '$totalSeconds',
                        },
                    },
                },
            },
        ]);
        const totalSeconds = report.reduce((sum, r) => sum + r.totalSeconds, 0);
        const billableSeconds = report.reduce((sum, r) => sum + r.billableSeconds, 0);
        res.json({
            byUser: report,
            totals: {
                totalSeconds,
                totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
                billableSeconds,
                billableHours: Math.round((billableSeconds / 3600) * 100) / 100,
            },
        });
    }
    catch (error) {
        console.error('Get project time report error:', error);
        res.status(500).json({ message: 'Failed to get time report' });
    }
};
exports.getProjectTimeReport = getProjectTimeReport;
//# sourceMappingURL=timeEntryController.js.map