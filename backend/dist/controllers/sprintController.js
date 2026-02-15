"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSprintTasks = exports.deleteSprint = exports.updateSprint = exports.createSprint = exports.getSprintById = exports.getAllSprints = void 0;
const Sprint_js_1 = require("../models/Sprint.js");
const Task_js_1 = require("../models/Task.js");
// Get all sprints
const getAllSprints = async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = {};
        if (projectId)
            query.projectId = projectId;
        const sprints = await Sprint_js_1.Sprint.find(query)
            .populate('projectId', 'name icon color')
            .sort({ startDate: -1 });
        res.json({ data: sprints });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching sprints', error: error.message });
    }
};
exports.getAllSprints = getAllSprints;
// Get sprint by ID
const getSprintById = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await Sprint_js_1.Sprint.findById(id)
            .populate('projectId', 'name icon color');
        if (!sprint) {
            res.status(404).json({ message: 'Sprint not found' });
            return;
        }
        // Get tasks in sprint
        const tasks = await Task_js_1.Task.find({ sprint: id })
            .populate('assignees', 'name avatar');
        res.json({ sprint, tasks });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching sprint', error: error.message });
    }
};
exports.getSprintById = getSprintById;
// Create new sprint
const createSprint = async (req, res) => {
    try {
        const { name, goal, startDate, endDate, capacity, projectId } = req.body;
        const sprint = new Sprint_js_1.Sprint({
            name,
            goal,
            startDate,
            endDate,
            capacity: capacity || 80,
            projectId,
        });
        await sprint.save();
        res.status(201).json({
            message: 'Sprint created successfully',
            sprint,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating sprint', error: error.message });
    }
};
exports.createSprint = createSprint;
// Update sprint
const updateSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await Sprint_js_1.Sprint.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!sprint) {
            res.status(404).json({ message: 'Sprint not found' });
            return;
        }
        res.json({
            message: 'Sprint updated successfully',
            sprint,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating sprint', error: error.message });
    }
};
exports.updateSprint = updateSprint;
// Delete sprint
const deleteSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await Sprint_js_1.Sprint.findByIdAndDelete(id);
        if (!sprint) {
            res.status(404).json({ message: 'Sprint not found' });
            return;
        }
        // Remove sprint reference from tasks
        await Task_js_1.Task.updateMany({ sprint: id }, { $unset: { sprint: 1 } });
        res.json({ message: 'Sprint deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting sprint', error: error.message });
    }
};
exports.deleteSprint = deleteSprint;
// Get tasks in sprint
const getSprintTasks = async (req, res) => {
    try {
        const { id } = req.params;
        const tasks = await Task_js_1.Task.find({ sprint: id })
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .sort({ status: 1, priority: -1 });
        res.json({ tasks });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching sprint tasks', error: error.message });
    }
};
exports.getSprintTasks = getSprintTasks;
//# sourceMappingURL=sprintController.js.map