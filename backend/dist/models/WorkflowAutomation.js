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
exports.AutomationRun = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const triggerConditionSchema = new mongoose_1.Schema({
    field: { type: String, required: true },
    operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'changed_to', 'changed_from'],
        required: true,
    },
    value: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
const automationActionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: [
            'update_task_field',
            'assign_task',
            'add_label',
            'remove_label',
            'move_to_sprint',
            'send_notification',
            'send_email',
            'create_task',
            'add_comment',
            'trigger_webhook',
            'send_slack_message',
        ],
        required: true,
    },
    config: { type: mongoose_1.Schema.Types.Mixed, required: true },
    condition: triggerConditionSchema,
    order: { type: Number, default: 0 },
}, { _id: false });
const workflowAutomationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true },
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    trigger: {
        type: {
            type: String,
            enum: [
                'task_created',
                'task_updated',
                'task_status_changed',
                'task_assigned',
                'task_due_date_approaching',
                'task_overdue',
                'task_completed',
                'comment_added',
                'sprint_started',
                'sprint_ended',
                'schedule',
            ],
            required: true,
        },
        conditions: [triggerConditionSchema],
        schedule: {
            cron: { type: String },
            timezone: { type: String, default: 'UTC' },
        },
    },
    actions: [automationActionSchema],
    isActive: { type: Boolean, default: true },
    // Stats
    lastTriggeredAt: { type: Date },
    triggerCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    lastError: { type: String },
}, { timestamps: true });
// Indexes
workflowAutomationSchema.index({ projectId: 1, isActive: 1 });
workflowAutomationSchema.index({ workspaceId: 1, isActive: 1 });
workflowAutomationSchema.index({ 'trigger.type': 1, isActive: 1 });
// Pre-save validation
workflowAutomationSchema.pre('save', function (next) {
    // Ensure at least one action
    if (!this.actions || this.actions.length === 0) {
        return next(new Error('Automation must have at least one action'));
    }
    // Validate schedule trigger has cron
    if (this.trigger.type === 'schedule' && !this.trigger.schedule?.cron) {
        return next(new Error('Schedule trigger requires a cron expression'));
    }
    next();
});
exports.default = mongoose_1.default.model('WorkflowAutomation', workflowAutomationSchema);
const automationRunSchema = new mongoose_1.Schema({
    automationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'WorkflowAutomation', required: true },
    triggeredBy: {
        type: String,
        enum: ['event', 'schedule', 'manual'],
        required: true,
    },
    triggerEvent: { type: String },
    triggerData: { type: mongoose_1.Schema.Types.Mixed },
    actionsExecuted: [
        {
            actionType: { type: String, required: true },
            status: {
                type: String,
                enum: ['success', 'failed', 'skipped'],
                required: true,
            },
            result: { type: mongoose_1.Schema.Types.Mixed },
            error: { type: String },
            durationMs: { type: Number, required: true },
        },
    ],
    status: {
        type: String,
        enum: ['running', 'completed', 'failed', 'partial'],
        default: 'running',
    },
    totalDurationMs: { type: Number },
    errorMessage: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Indexes
automationRunSchema.index({ automationId: 1, createdAt: -1 });
automationRunSchema.index({ status: 1 });
// TTL for cleanup (14 days)
automationRunSchema.index({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });
exports.AutomationRun = mongoose_1.default.model('AutomationRun', automationRunSchema);
//# sourceMappingURL=WorkflowAutomation.js.map