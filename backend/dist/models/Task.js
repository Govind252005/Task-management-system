"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const commentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
}, {
    timestamps: true,
});
const labelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
});
const taskSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'review', 'done'],
        default: 'todo',
    },
    priority: {
        type: String,
        enum: ['urgent', 'high', 'medium', 'low'],
        default: 'medium',
    },
    assignees: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    reporter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    labels: [labelSchema],
    dueDate: {
        type: Date,
    },
    comments: [commentSchema],
    attachments: {
        type: Number,
        default: 0,
    },
    subtasks: {
        total: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
    },
    timeEstimate: {
        type: Number,
        default: 0,
    },
    timeLogged: {
        type: Number,
        default: 0,
    },
    sprint: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Sprint',
    },
    dependencies: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Task',
        }],
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
        default: null,
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
    },
}, {
    timestamps: true,
});
// Auto-generate task code before saving
taskSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.code) {
        const count = await mongoose_1.default.model('Task').countDocuments();
        doc.code = `TASK-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});
// Index for efficient queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ reporter: 1 });
exports.Task = mongoose_1.default.model('Task', taskSchema);
//# sourceMappingURL=Task.js.map