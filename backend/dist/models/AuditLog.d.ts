import mongoose, { Document } from 'mongoose';
export type AuditAction = 'create' | 'update' | 'delete' | 'archive' | 'restore' | 'login' | 'logout' | 'login_failed' | 'password_change' | 'password_reset' | 'invite_sent' | 'invite_accepted' | 'member_added' | 'member_removed' | 'role_changed' | 'permission_changed' | 'settings_changed' | 'export' | 'import' | 'api_access' | '2fa_enabled' | '2fa_disabled';
export type AuditEntityType = 'user' | 'project' | 'task' | 'sprint' | 'comment' | 'attachment' | 'label' | 'workspace' | 'settings' | 'integration' | 'webhook' | 'report';
export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: mongoose.Types.ObjectId;
    entityName?: string;
    projectId?: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    previousValue?: Record<string, any>;
    newValue?: Record<string, any>;
    changedFields?: string[];
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    metadata?: Record<string, any>;
    severity: 'info' | 'warning' | 'critical';
    createdAt: Date;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AuditLog.d.ts.map