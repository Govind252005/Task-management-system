import mongoose, { Document } from 'mongoose';
export interface IWorkspaceMember {
    userId: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'guest';
    joinedAt: Date;
    invitedBy?: mongoose.Types.ObjectId;
}
export interface IWorkspaceSettings {
    allowPublicProjects: boolean;
    defaultProjectVisibility: 'public' | 'private';
    requireApprovalForJoin: boolean;
    allowGuestAccess: boolean;
    maxProjectsPerUser: number;
    maxMembersPerProject: number;
    enableTimeTracking: boolean;
    enableCustomFields: boolean;
    enableAutomations: boolean;
}
export interface IWorkspace extends Document {
    name: string;
    slug: string;
    description?: string;
    ownerId: mongoose.Types.ObjectId;
    logoUrl?: string;
    members: IWorkspaceMember[];
    settings: IWorkspaceSettings;
    maxProjects: number;
    maxMembers: number;
    maxStorage: number;
    usedStorage: number;
    plan: 'free' | 'pro' | 'enterprise';
    billingEmail?: string;
    isActive: boolean;
    isDefault: boolean;
    projectCount: number;
    taskCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IWorkspace, {}, {}, {}, mongoose.Document<unknown, {}, IWorkspace, {}, {}> & IWorkspace & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Workspace.d.ts.map