import mongoose, { Document } from 'mongoose';
export type IntegrationType = 'slack' | 'github' | 'google_calendar';
export type IntegrationStatus = 'connected' | 'disconnected' | 'expired' | 'error';
export interface ISlackConfig {
    teamId: string;
    teamName: string;
    channelId?: string;
    channelName?: string;
    botUserId?: string;
    notifyOnTaskCreated: boolean;
    notifyOnTaskCompleted: boolean;
    notifyOnMention: boolean;
    notifyOnComment: boolean;
    notifyOnDueDate: boolean;
}
export interface IGitHubConfig {
    accountId: number;
    accountLogin: string;
    accountType: 'user' | 'organization';
    linkedRepositories: {
        repoId: number;
        repoFullName: string;
        projectId?: mongoose.Types.ObjectId;
    }[];
    linkCommitsToTasks: boolean;
    linkPRsToTasks: boolean;
    createTasksFromIssues: boolean;
    closeTasksOnPRMerge: boolean;
}
export interface IGoogleCalendarConfig {
    calendarId: string;
    calendarName: string;
    syncTasksDueDates: boolean;
    syncSprintDates: boolean;
    defaultReminderMinutes: number;
    colorId?: string;
}
export interface IIntegration extends Document {
    userId: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    type: IntegrationType;
    status: IntegrationStatus;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    scope?: string;
    slackConfig?: ISlackConfig;
    githubConfig?: IGitHubConfig;
    googleCalendarConfig?: IGoogleCalendarConfig;
    lastSyncAt?: Date;
    lastError?: string;
    errorCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IIntegration, {}, {}, {}, mongoose.Document<unknown, {}, IIntegration, {}, {}> & IIntegration & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Integration.d.ts.map