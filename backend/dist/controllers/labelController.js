"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLabel = exports.updateLabel = exports.createLabel = exports.getLabelById = exports.getAllLabels = void 0;
const Label_js_1 = require("../models/Label.js");
// Get all labels
const getAllLabels = async (req, res) => {
    try {
        const labels = await Label_js_1.Label.find().sort({ name: 1 });
        res.json({ data: labels });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching labels', error: error.message });
    }
};
exports.getAllLabels = getAllLabels;
// Get label by ID
const getLabelById = async (req, res) => {
    try {
        const { id } = req.params;
        const label = await Label_js_1.Label.findById(id);
        if (!label) {
            res.status(404).json({ message: 'Label not found' });
            return;
        }
        res.json({ label });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching label', error: error.message });
    }
};
exports.getLabelById = getLabelById;
// Create new label
const createLabel = async (req, res) => {
    try {
        const { name, color } = req.body;
        const label = new Label_js_1.Label({ name, color });
        await label.save();
        res.status(201).json({
            message: 'Label created successfully',
            label,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating label', error: error.message });
    }
};
exports.createLabel = createLabel;
// Update label
const updateLabel = async (req, res) => {
    try {
        const { id } = req.params;
        const label = await Label_js_1.Label.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!label) {
            res.status(404).json({ message: 'Label not found' });
            return;
        }
        res.json({
            message: 'Label updated successfully',
            label,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating label', error: error.message });
    }
};
exports.updateLabel = updateLabel;
// Delete label
const deleteLabel = async (req, res) => {
    try {
        const { id } = req.params;
        const label = await Label_js_1.Label.findByIdAndDelete(id);
        if (!label) {
            res.status(404).json({ message: 'Label not found' });
            return;
        }
        res.json({ message: 'Label deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting label', error: error.message });
    }
};
exports.deleteLabel = deleteLabel;
//# sourceMappingURL=labelController.js.map