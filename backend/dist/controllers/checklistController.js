"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderChecklistItems = exports.toggleChecklistItem = exports.deleteChecklistItem = exports.updateChecklistItem = exports.addChecklistItem = exports.deleteChecklist = exports.updateChecklist = exports.createChecklist = exports.getTaskChecklists = void 0;
const Checklist_js_1 = __importDefault(require("../models/Checklist.js"));
const Task_js_1 = require("../models/Task.js");
// Get all checklists for a task
const getTaskChecklists = async (req, res) => {
    try {
        const { taskId } = req.params;
        const checklists = await Checklist_js_1.default.find({ taskId }).sort({ createdAt: 1 });
        res.json(checklists);
    }
    catch (error) {
        console.error('Get checklists error:', error);
        res.status(500).json({ message: 'Failed to fetch checklists' });
    }
};
exports.getTaskChecklists = getTaskChecklists;
// Create a new checklist
const createChecklist = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, items } = req.body;
        // Verify task exists
        const task = await Task_js_1.Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const checklist = new Checklist_js_1.default({
            taskId,
            title,
            createdBy: req.user?._id,
            items: items?.map((item, index) => ({
                title: item.title,
                order: item.order ?? index,
                completed: false,
            })) || [],
        });
        await checklist.save();
        res.status(201).json(checklist);
    }
    catch (error) {
        console.error('Create checklist error:', error);
        res.status(500).json({ message: 'Failed to create checklist' });
    }
};
exports.createChecklist = createChecklist;
// Update checklist title
const updateChecklist = async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { title } = req.body;
        const checklist = await Checklist_js_1.default.findByIdAndUpdate(checklistId, { title }, { new: true });
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.json(checklist);
    }
    catch (error) {
        console.error('Update checklist error:', error);
        res.status(500).json({ message: 'Failed to update checklist' });
    }
};
exports.updateChecklist = updateChecklist;
// Delete checklist
const deleteChecklist = async (req, res) => {
    try {
        const { checklistId } = req.params;
        const checklist = await Checklist_js_1.default.findByIdAndDelete(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.json({ message: 'Checklist deleted successfully' });
    }
    catch (error) {
        console.error('Delete checklist error:', error);
        res.status(500).json({ message: 'Failed to delete checklist' });
    }
};
exports.deleteChecklist = deleteChecklist;
// Add item to checklist
const addChecklistItem = async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { title, assigneeId } = req.body;
        const checklist = await Checklist_js_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        const newOrder = checklist.items.length > 0
            ? Math.max(...checklist.items.map((i) => i.order)) + 1
            : 0;
        checklist.items.push({
            title,
            order: newOrder,
            completed: false,
            assigneeId,
        });
        await checklist.save();
        res.status(201).json(checklist);
    }
    catch (error) {
        console.error('Add checklist item error:', error);
        res.status(500).json({ message: 'Failed to add item' });
    }
};
exports.addChecklistItem = addChecklistItem;
// Update checklist item
const updateChecklistItem = async (req, res) => {
    try {
        const { checklistId, itemId } = req.params;
        const { title, completed, assigneeId, dueDate, order } = req.body;
        const checklist = await Checklist_js_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        const item = checklist.items.find((i) => i._id?.toString() === itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (title !== undefined)
            item.title = title;
        if (completed !== undefined) {
            item.completed = completed;
            item.completedAt = completed ? new Date() : undefined;
        }
        if (assigneeId !== undefined)
            item.assigneeId = assigneeId;
        if (dueDate !== undefined)
            item.dueDate = dueDate;
        if (order !== undefined)
            item.order = order;
        await checklist.save();
        res.json(checklist);
    }
    catch (error) {
        console.error('Update checklist item error:', error);
        res.status(500).json({ message: 'Failed to update item' });
    }
};
exports.updateChecklistItem = updateChecklistItem;
// Delete checklist item
const deleteChecklistItem = async (req, res) => {
    try {
        const { checklistId, itemId } = req.params;
        const checklist = await Checklist_js_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        checklist.items = checklist.items.filter((i) => i._id?.toString() !== itemId);
        await checklist.save();
        res.json(checklist);
    }
    catch (error) {
        console.error('Delete checklist item error:', error);
        res.status(500).json({ message: 'Failed to delete item' });
    }
};
exports.deleteChecklistItem = deleteChecklistItem;
// Toggle item completion
const toggleChecklistItem = async (req, res) => {
    try {
        const { checklistId, itemId } = req.params;
        const checklist = await Checklist_js_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        const item = checklist.items.find((i) => i._id?.toString() === itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.completed = !item.completed;
        item.completedAt = item.completed ? new Date() : undefined;
        await checklist.save();
        res.json(checklist);
    }
    catch (error) {
        console.error('Toggle checklist item error:', error);
        res.status(500).json({ message: 'Failed to toggle item' });
    }
};
exports.toggleChecklistItem = toggleChecklistItem;
// Reorder checklist items
const reorderChecklistItems = async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { itemIds } = req.body; // Array of item IDs in new order
        const checklist = await Checklist_js_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        // Update order based on array position
        itemIds.forEach((id, index) => {
            const item = checklist.items.find((i) => i._id?.toString() === id);
            if (item) {
                item.order = index;
            }
        });
        await checklist.save();
        res.json(checklist);
    }
    catch (error) {
        console.error('Reorder checklist items error:', error);
        res.status(500).json({ message: 'Failed to reorder items' });
    }
};
exports.reorderChecklistItems = reorderChecklistItems;
//# sourceMappingURL=checklistController.js.map