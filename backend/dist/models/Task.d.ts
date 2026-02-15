import mongoose, { Types } from 'mongoose';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export interface IComment {
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
}
export interface ILabel {
    name: string;
    color: string;
}
export interface ITask {
    code: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    assignees: Types.ObjectId[];
    reporter: Types.ObjectId;
    labels: ILabel[];
    dueDate: Date;
    comments: IComment[];
    attachments: number;
    subtasks: {
        total: number;
        completed: number;
    };
    timeEstimate: number;
    timeLogged: number;
    sprint?: Types.ObjectId;
    dependencies: Types.ObjectId[];
    projectId: Types.ObjectId;
    parentId: Types.ObjectId | null;
    organizationId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, {}> & ITask & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Task.d.ts.map