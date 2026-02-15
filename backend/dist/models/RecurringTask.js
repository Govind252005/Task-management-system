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
const mongoose_1 = __importStar(require("mongoose"));
const recurringTaskSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TaskTemplate' },
    // Task fields
    title: { type: String, required: true },
    description: { type: String },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    assignees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    labels: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Label' }],
    estimatedHours: { type: Number },
    // Recurrence
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom'],
        required: true,
    },
    customCron: { type: String },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    dayOfMonth: { type: Number, min: 1, max: 31 },
    monthOfYear: { type: Number, min: 1, max: 12 },
    time: { type: String, default: '09:00' },
    timezone: { type: String, default: 'UTC' },
    // Schedule
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextRunAt: { type: Date, required: true },
    lastRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
    maxRuns: { type: Number },
    // Status
    isActive: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
    // Tracking
    createdTasks: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Task' }],
}, { timestamps: true });
// Indexes
recurringTaskSchema.index({ projectId: 1 });
recurringTaskSchema.index({ nextRunAt: 1, isActive: 1, isPaused: 1 });
recurringTaskSchema.index({ createdBy: 1 });
// Static method to find due recurring tasks
recurringTaskSchema.statics.findDueTasks = function () {
    return this.find({
        isActive: true,
        isPaused: false,
        nextRunAt: { $lte: new Date() },
        $and: [
            { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }] },
            { $or: [{ maxRuns: { $exists: false } }, { $expr: { $lt: ['$runCount', '$maxRuns'] } }] },
        ],
    });
};
exports.default = mongoose_1.default.model('RecurringTask', recurringTaskSchema);
//# sourceMappingURL=RecurringTask.js.map