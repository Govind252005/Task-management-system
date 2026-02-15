"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.getTaskAttachments = exports.uploadFile = exports.upload = void 0;
const cloudinary_js_1 = __importDefault(require("../config/cloudinary.js"));
const Attachment_js_1 = require("../models/Attachment.js");
const Task_js_1 = require("../models/Task.js");
const multer_1 = __importDefault(require("multer"));
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    },
});
// Upload file to Cloudinary
const uploadFile = async (req, res) => {
    try {
        const { taskId } = req.params;
        const currentUser = req.user;
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        // Verify task exists
        const task = await Task_js_1.Task.findById(taskId);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_js_1.default.uploader.upload_stream({
                folder: 'loom-attachments',
                resource_type: 'auto',
                public_id: `${taskId}-${Date.now()}`,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        // Save attachment to database
        const attachment = new Attachment_js_1.Attachment({
            filename: result.public_id,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: result.secure_url,
            publicId: result.public_id,
            taskId,
            uploadedBy: currentUser._id,
        });
        await attachment.save();
        // Update task attachment count
        await Task_js_1.Task.findByIdAndUpdate(taskId, { $inc: { attachments: 1 } });
        res.status(201).json({
            message: 'File uploaded successfully',
            attachment: {
                id: attachment._id,
                filename: attachment.originalName,
                url: attachment.url,
                size: attachment.size,
                mimeType: attachment.mimeType,
                uploadedBy: currentUser.name,
                createdAt: attachment.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};
exports.uploadFile = uploadFile;
// Get attachments for a task
const getTaskAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const attachments = await Attachment_js_1.Attachment.find({ taskId })
            .populate('uploadedBy', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ attachments });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching attachments', error: error.message });
    }
};
exports.getTaskAttachments = getTaskAttachments;
// Delete attachment
const deleteAttachment = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const attachment = await Attachment_js_1.Attachment.findById(id);
        if (!attachment) {
            res.status(404).json({ message: 'Attachment not found' });
            return;
        }
        // Check permission (uploader or admin/manager)
        const canDelete = attachment.uploadedBy.toString() === currentUser._id.toString() ||
            ['admin', 'manager'].includes(currentUser.role);
        if (!canDelete) {
            res.status(403).json({ message: 'Not authorized to delete this attachment' });
            return;
        }
        // Delete from Cloudinary
        await cloudinary_js_1.default.uploader.destroy(attachment.publicId);
        // Delete from database
        await Attachment_js_1.Attachment.findByIdAndDelete(id);
        // Update task attachment count
        await Task_js_1.Task.findByIdAndUpdate(attachment.taskId, { $inc: { attachments: -1 } });
        res.json({ message: 'Attachment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting attachment', error: error.message });
    }
};
exports.deleteAttachment = deleteAttachment;
//# sourceMappingURL=uploadController.js.map