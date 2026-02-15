"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const workspaceMemberSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member', 'guest'],
        default: 'member',
    },
    joinedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });
const workspaceSettingsSchema = new mongoose_1.Schema({
    allowPublicProjects: { type: Boolean, default: true },
    defaultProjectVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private',
    },
    requireApprovalForJoin: { type: Boolean, default: false },
    allowGuestAccess: { type: Boolean, default: true },
    maxProjectsPerUser: { type: Number, default: 10 },
    maxMembersPerProject: { type: Number, default: 50 },
    enableTimeTracking: { type: Boolean, default: true },
    enableCustomFields: { type: Boolean, default: true },
    enableAutomations: { type: Boolean, default: true },
}, { _id: false });
const workspaceSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    logoUrl: { type: String },
    members: [workspaceMemberSchema],
    settings: {
        type: workspaceSettingsSchema,
        default: () => ({}),
    },
    // Limits
    maxProjects: { type: Number, default: 50 },
    maxMembers: { type: Number, default: 100 },
    maxStorage: { type: Number, default: 5 * 1024 * 1024 * 1024 }, // 5GB
    usedStorage: { type: Number, default: 0 },
    // Billing
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
    },
    billingEmail: { type: String },
    // Status
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    // Stats
    projectCount: { type: Number, default: 0 },
    taskCount: { type: Number, default: 0 },
}, { timestamps: true });
// Indexes
workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ 'members.userId': 1 });
// Pre-save middleware to generate slug
workspaceSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});
// Virtual for member count
workspaceSchema.virtual('memberCount').get(function () {
    return this.members?.length || 0;
});
// Method to check if user is member
workspaceSchema.methods.isMember = function (userId) {
    return this.members.some((m) => m.userId.equals(userId));
};
// Method to get user role
workspaceSchema.methods.getUserRole = function (userId) {
    const member = this.members.find((m) => m.userId.equals(userId));
    return member ? member.role : null;
};
// Method to check if user can perform action
workspaceSchema.methods.canManage = function (userId) {
    const role = this.getUserRole(userId);
    return role === 'owner' || role === 'admin';
};
exports.default = mongoose_1.default.model('Workspace', workspaceSchema);
//# sourceMappingURL=Workspace.js.map