import mongoose, { Types } from 'mongoose';
export interface ILabel {
    name: string;
    color: string;
    organizationId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Label: mongoose.Model<ILabel, {}, {}, {}, mongoose.Document<unknown, {}, ILabel, {}, {}> & ILabel & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Label.d.ts.map