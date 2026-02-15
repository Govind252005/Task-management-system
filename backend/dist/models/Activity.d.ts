import mongoose, { Types } from 'mongoose';
export interface IActivity {
    userId: Types.ObjectId;
    action: string;
    target: string;
    targetType: 'task' | 'project' | 'comment' | 'sprint' | 'user';
    targetId: Types.ObjectId;
    metadata: Record<string, any>;
    organizationId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Activity: mongoose.Model<IActivity, {}, {}, {}, mongoose.Document<unknown, {}, IActivity, {}, {}> & IActivity & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Activity.d.ts.map