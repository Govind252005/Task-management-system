import mongoose, { Types } from 'mongoose';
export interface INotification {
    userId: Types.ObjectId;
    fromUserId: Types.ObjectId;
    action: string;
    target: string;
    targetType: 'task' | 'project' | 'comment' | 'sprint' | 'user' | 'message';
    taskId: Types.ObjectId | null;
    projectId: Types.ObjectId | null;
    read: boolean;
    emailSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map