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
const slackConfigSchema = new mongoose_1.Schema({
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    channelId: { type: String },
    channelName: { type: String },
    botUserId: { type: String },
    notifyOnTaskCreated: { type: Boolean, default: true },
    notifyOnTaskCompleted: { type: Boolean, default: true },
    notifyOnMention: { type: Boolean, default: true },
    notifyOnComment: { type: Boolean, default: true },
    notifyOnDueDate: { type: Boolean, default: true },
}, { _id: false });
const githubConfigSchema = new mongoose_1.Schema({
    accountId: { type: Number, required: true },
    accountLogin: { type: String, required: true },
    accountType: { type: String, enum: ['user', 'organization'], required: true },
    linkedRepositories: [
        {
            repoId: { type: Number, required: true },
            repoFullName: { type: String, required: true },
            projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
        },
    ],
    linkCommitsToTasks: { type: Boolean, default: true },
    linkPRsToTasks: { type: Boolean, default: true },
    createTasksFromIssues: { type: Boolean, default: false },
    closeTasksOnPRMerge: { type: Boolean, default: true },
}, { _id: false });
const googleCalendarConfigSchema = new mongoose_1.Schema({
    calendarId: { type: String, required: true },
    calendarName: { type: String, required: true },
    syncTasksDueDates: { type: Boolean, default: true },
    syncSprintDates: { type: Boolean, default: true },
    defaultReminderMinutes: { type: Number, default: 30 },
    colorId: { type: String },
}, { _id: false });
const integrationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace' },
    type: {
        type: String,
        enum: ['slack', 'github', 'google_calendar'],
        required: true,
    },
    status: {
        type: String,
        enum: ['connected', 'disconnected', 'expired', 'error'],
        default: 'connected',
    },
    // OAuth
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    scope: { type: String },
    // Configs
    slackConfig: slackConfigSchema,
    githubConfig: githubConfigSchema,
    googleCalendarConfig: googleCalendarConfigSchema,
    // Metadata
    lastSyncAt: { type: Date },
    lastError: { type: String },
    errorCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Indexes
integrationSchema.index({ userId: 1, type: 1 });
integrationSchema.index({ workspaceId: 1, type: 1 });
integrationSchema.index({ type: 1, status: 1 });
// Ensure unique integration per user/type
integrationSchema.index({ userId: 1, type: 1 }, { unique: true });
// Method to check if token is expired
integrationSchema.methods.isTokenExpired = function () {
    if (!this.tokenExpiresAt)
        return false;
    return new Date() >= this.tokenExpiresAt;
};
// Method to check if token needs refresh (5 minutes buffer)
integrationSchema.methods.needsTokenRefresh = function () {
    if (!this.tokenExpiresAt)
        return false;
    const buffer = 5 * 60 * 1000; // 5 minutes
    return new Date().getTime() >= this.tokenExpiresAt.getTime() - buffer;
};
exports.default = mongoose_1.default.model('Integration', integrationSchema);
//# sourceMappingURL=Integration.js.map