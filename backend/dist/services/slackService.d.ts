import mongoose from 'mongoose';
interface SlackChannel {
    id: string;
    name: string;
    isPrivate: boolean;
}
interface SlackMessage {
    channel: string;
    text: string;
    blocks?: any[];
    threadTs?: string;
}
interface TaskNotificationData {
    taskTitle: string;
    taskUrl: string;
    projectName: string;
    action: 'created' | 'completed' | 'updated' | 'assigned' | 'commented';
    performedBy: string;
    assignedTo?: string;
    description?: string;
    dueDate?: Date;
    priority?: string;
}
declare class SlackService {
    private client;
    constructor();
    private initialize;
    private isAvailable;
    private getClientForUser;
    testConnection(): Promise<boolean>;
    listChannels(accessToken?: string): Promise<SlackChannel[]>;
    sendMessage(message: SlackMessage, accessToken?: string): Promise<string>;
    sendTaskNotification(userId: mongoose.Types.ObjectId, data: TaskNotificationData): Promise<void>;
    private shouldNotify;
    private buildTaskNotificationText;
    private buildTaskNotificationBlocks;
    private getActionEmoji;
    private getActionText;
    private formatPriority;
    sendMentionNotification(userId: mongoose.Types.ObjectId, mentionedBy: string, taskTitle: string, taskUrl: string, comment: string): Promise<void>;
    sendDueDateReminder(userId: mongoose.Types.ObjectId, tasks: Array<{
        title: string;
        url: string;
        dueDate: Date;
        project: string;
    }>): Promise<void>;
}
export declare const slackService: SlackService;
export default slackService;
//# sourceMappingURL=slackService.d.ts.map