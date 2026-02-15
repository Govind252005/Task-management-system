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
const auditLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        enum: [
            'create',
            'update',
            'delete',
            'archive',
            'restore',
            'login',
            'logout',
            'login_failed',
            'password_change',
            'password_reset',
            'invite_sent',
            'invite_accepted',
            'member_added',
            'member_removed',
            'role_changed',
            'permission_changed',
            'settings_changed',
            'export',
            'import',
            'api_access',
            '2fa_enabled',
            '2fa_disabled',
        ],
        required: true,
    },
    entityType: {
        type: String,
        enum: [
            'user',
            'project',
            'task',
            'sprint',
            'comment',
            'attachment',
            'label',
            'workspace',
            'settings',
            'integration',
            'webhook',
            'report',
        ],
        required: true,
    },
    entityId: { type: mongoose_1.Schema.Types.ObjectId },
    entityName: { type: String },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace' },
    // Changes
    previousValue: { type: mongoose_1.Schema.Types.Mixed },
    newValue: { type: mongoose_1.Schema.Types.Mixed },
    changedFields: [{ type: String }],
    // Request info
    ipAddress: { type: String },
    userAgent: { type: String },
    requestId: { type: String },
    // Metadata
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info',
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ projectId: 1, createdAt: -1 });
auditLogSchema.index({ workspaceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
// TTL index to auto-delete old logs (optional - 1 year retention)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
// Static methods
auditLogSchema.statics.logAction = async function (userId, action, entityType, options = {}) {
    return this.create({
        userId,
        action,
        entityType,
        ...options,
    });
};
exports.default = mongoose_1.default.model('AuditLog', auditLogSchema);
//# sourceMappingURL=AuditLog.js.map