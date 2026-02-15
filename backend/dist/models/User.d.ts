import mongoose, { Document, Types } from 'mongoose';
import { Role, Department } from '../config/index.js';
export interface IUser {
    name: string;
    email: string;
    password: string;
    avatar: string;
    role: Role;
    department: Department;
    domain?: UserDomain;
    managerId: Types.ObjectId | null;
    teamMembers: Types.ObjectId[];
    organizationId: Types.ObjectId | null;
    activeTasks: number;
    capacity: number;
    isActive: boolean;
    emailNotifications: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export type UserDocument = Document<Types.ObjectId, {}, IUser> & IUser & IUserMethods;
export declare enum UserDomain {
    FRONTEND = "frontend",
    BACKEND = "backend",
    DESIGN = "design",
    QA = "qa",
    DEVOPS = "devops",
    PRODUCT = "product"
}
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;
export declare const User: UserModel;
export {};
//# sourceMappingURL=User.d.ts.map