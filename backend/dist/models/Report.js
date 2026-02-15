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
exports.Report = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reportSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reportType: {
        type: String,
        enum: ['individual', 'team', 'project', 'department', 'organization'],
        required: true,
    },
    targetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        default: null,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    dateRange: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    data: {
        tasksCompleted: { type: Number, default: 0 },
        tasksInProgress: { type: Number, default: 0 },
        tasksTodo: { type: Number, default: 0 },
        tasksInReview: { type: Number, default: 0 },
        totalHoursLogged: { type: Number, default: 0 },
        totalHoursEstimated: { type: Number, default: 0 },
        projectsContributed: { type: Number, default: 0 },
        averageTaskCompletionTime: { type: Number, default: 0 },
        overdueTasks: { type: Number, default: 0 },
        tasksByPriority: {
            urgent: { type: Number, default: 0 },
            high: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            low: { type: Number, default: 0 },
        },
    },
    charts: {
        productivity: { type: mongoose_1.Schema.Types.Mixed, default: {} },
        timeDistribution: { type: mongoose_1.Schema.Types.Mixed, default: {} },
        tasksByStatus: { type: mongoose_1.Schema.Types.Mixed, default: {} },
        dailyProgress: [{ date: String, completed: Number }],
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
    },
}, {
    timestamps: true,
});
// Index for efficient queries
reportSchema.index({ userId: 1, reportType: 1 });
reportSchema.index({ generatedAt: -1 });
exports.Report = mongoose_1.default.model('Report', reportSchema);
//# sourceMappingURL=Report.js.map