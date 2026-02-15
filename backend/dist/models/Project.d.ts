import mongoose, { Types } from 'mongoose';
export interface IProject {
    name: string;
    description: string;
    icon: string;
    color: string;
    progress: number;
    deadline?: Date;
    members: Types.ObjectId[];
    tasksCount: number;
    completedTasks: number;
    departmentId: string;
    teamLeadId?: Types.ObjectId;
    visibility: 'public' | 'team' | 'private';
    organizationId?: Types.ObjectId;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, {}> & IProject & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Project.d.ts.map