import mongoose, { Document } from 'mongoose';
export type WebhookEvent = 'task.created' | 'task.updated' | 'task.deleted' | 'task.completed' | 'task.assigned' | 'task.commented' | 'project.created' | 'project.updated' | 'project.deleted' | 'sprint.started' | 'sprint.completed' | 'member.added' | 'member.removed';
export interface IWebhook extends Document {
    name: string;
    url: string;
    secret: string;
    projectId?: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    events: WebhookEvent[];
    isActive: boolean;
    headers?: Record<string, string>;
    retryCount: number;
    retryDelayMs: number;
    lastTriggeredAt?: Date;
    lastSuccessAt?: Date;
    lastFailureAt?: Date;
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    consecutiveFailures: number;
    isDisabledBySystem: boolean;
    disabledReason?: string;
    createdAt: Date;
    updatedAt: Date;
    generateSignature(payload: string): string;
    verifySignature(payload: string, signature: string): boolean;
}
declare const _default: mongoose.Model<IWebhook, {}, {}, {}, mongoose.Document<unknown, {}, IWebhook, {}, {}> & IWebhook & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
export interface IWebhookDelivery extends Document {
    webhookId: mongoose.Types.ObjectId;
    event: WebhookEvent;
    payload: Record<string, any>;
    requestHeaders: Record<string, string>;
    responseStatus?: number;
    responseHeaders?: Record<string, string>;
    responseBody?: string;
    durationMs?: number;
    status: 'pending' | 'success' | 'failed';
    errorMessage?: string;
    attemptNumber: number;
    nextRetryAt?: Date;
    createdAt: Date;
}
export declare const WebhookDelivery: mongoose.Model<IWebhookDelivery, {}, {}, {}, mongoose.Document<unknown, {}, IWebhookDelivery, {}, {}> & IWebhookDelivery & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Webhook.d.ts.map