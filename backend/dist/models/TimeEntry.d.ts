import mongoose, { Document } from 'mongoose';
export interface ITimeEntry extends Document {
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    description?: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    isBillable: boolean;
    isRunning: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITimeEntry, {}, {}, {}, mongoose.Document<unknown, {}, ITimeEntry, {}, {}> & ITimeEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TimeEntry.d.ts.map