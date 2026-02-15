import mongoose, { Types } from 'mongoose';
export interface ISprint {
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    capacity: number;
    committed: number;
    projectId: Types.ObjectId;
    organizationId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Sprint: mongoose.Model<ISprint, {}, {}, {}, mongoose.Document<unknown, {}, ISprint, {}, {}> & ISprint & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Sprint.d.ts.map