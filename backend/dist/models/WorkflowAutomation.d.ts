import mongoose, { Document } from 'mongoose';
export type TriggerType = 'task_created' | 'task_updated' | 'task_status_changed' | 'task_assigned' | 'task_due_date_approaching' | 'task_overdue' | 'task_completed' | 'comment_added' | 'sprint_started' | 'sprint_ended' | 'schedule';
export type ActionType = 'update_task_field' | 'assign_task' | 'add_label' | 'remove_label' | 'move_to_sprint' | 'send_notification' | 'send_email' | 'create_task' | 'add_comment' | 'trigger_webhook' | 'send_slack_message';
export interface ITriggerCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'changed_to' | 'changed_from';
    value: any;
}
export interface IAutomationAction {
    type: ActionType;
    config: Record<string, any>;
    condition?: ITriggerCondition;
    order: number;
}
export interface IWorkflowAutomation extends Document {
    name: string;
    description?: string;
    projectId: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    trigger: {
        type: TriggerType;
        conditions: ITriggerCondition[];
        schedule?: {
            cron: string;
            timezone: string;
        };
    };
    actions: IAutomationAction[];
    isActive: boolean;
    lastTriggeredAt?: Date;
    triggerCount: number;
    successCount: number;
    failureCount: number;
    lastError?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IWorkflowAutomation, {}, {}, {}, mongoose.Document<unknown, {}, IWorkflowAutomation, {}, {}> & IWorkflowAutomation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
export interface IAutomationRun extends Document {
    automationId: mongoose.Types.ObjectId;
    triggeredBy: 'event' | 'schedule' | 'manual';
    triggerEvent?: string;
    triggerData?: Record<string, any>;
    actionsExecuted: {
        actionType: ActionType;
        status: 'success' | 'failed' | 'skipped';
        result?: Record<string, any>;
        error?: string;
        durationMs: number;
    }[];
    status: 'running' | 'completed' | 'failed' | 'partial';
    totalDurationMs: number;
    errorMessage?: string;
    createdAt: Date;
}
export declare const AutomationRun: mongoose.Model<IAutomationRun, {}, {}, {}, mongoose.Document<unknown, {}, IAutomationRun, {}, {}> & IAutomationRun & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WorkflowAutomation.d.ts.map