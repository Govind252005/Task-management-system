import mongoose, { Types } from 'mongoose';
export interface IPasswordReset {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}
export declare const PasswordReset: mongoose.Model<IPasswordReset, {}, {}, {}, mongoose.Document<unknown, {}, IPasswordReset, {}, {}> & IPasswordReset & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=PasswordReset.d.ts.map