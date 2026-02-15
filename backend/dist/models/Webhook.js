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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDelivery = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const webhookSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    secret: { type: String, required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    events: [
        {
            type: String,
            enum: [
                'task.created',
                'task.updated',
                'task.deleted',
                'task.completed',
                'task.assigned',
                'task.commented',
                'project.created',
                'project.updated',
                'project.deleted',
                'sprint.started',
                'sprint.completed',
                'member.added',
                'member.removed',
            ],
        },
    ],
    isActive: { type: Boolean, default: true },
    headers: { type: Map, of: String },
    retryCount: { type: Number, default: 3 },
    retryDelayMs: { type: Number, default: 1000 },
    // Stats
    lastTriggeredAt: { type: Date },
    lastSuccessAt: { type: Date },
    lastFailureAt: { type: Date },
    totalDeliveries: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    // Health
    consecutiveFailures: { type: Number, default: 0 },
    isDisabledBySystem: { type: Boolean, default: false },
    disabledReason: { type: String },
}, { timestamps: true });
// Indexes
webhookSchema.index({ projectId: 1, isActive: 1 });
webhookSchema.index({ workspaceId: 1, isActive: 1 });
webhookSchema.index({ events: 1, isActive: 1 });
// Generate secret on creation
webhookSchema.pre('save', function (next) {
    if (this.isNew && !this.secret) {
        this.secret = crypto_1.default.randomBytes(32).toString('hex');
    }
    next();
});
// Generate HMAC signature
webhookSchema.methods.generateSignature = function (payload) {
    return crypto_1.default.createHmac('sha256', this.secret).update(payload).digest('hex');
};
// Verify signature
webhookSchema.methods.verifySignature = function (payload, signature) {
    const expectedSignature = this.generateSignature(payload);
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};
exports.default = mongoose_1.default.model('Webhook', webhookSchema);
const webhookDeliverySchema = new mongoose_1.Schema({
    webhookId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Webhook', required: true },
    event: { type: String, required: true },
    payload: { type: mongoose_1.Schema.Types.Mixed, required: true },
    requestHeaders: { type: Map, of: String },
    responseStatus: { type: Number },
    responseHeaders: { type: Map, of: String },
    responseBody: { type: String },
    durationMs: { type: Number },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
    },
    errorMessage: { type: String },
    attemptNumber: { type: Number, default: 1 },
    nextRetryAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Indexes
webhookDeliverySchema.index({ webhookId: 1, createdAt: -1 });
webhookDeliverySchema.index({ status: 1, nextRetryAt: 1 });
// TTL to cleanup old deliveries (30 days)
webhookDeliverySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
exports.WebhookDelivery = mongoose_1.default.model('WebhookDelivery', webhookDeliverySchema);
//# sourceMappingURL=Webhook.js.map