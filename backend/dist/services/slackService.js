"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackService = void 0;
const web_api_1 = require("@slack/web-api");
const index_js_1 = require("../config/index.js");
const Integration_js_1 = __importDefault(require("../models/Integration.js"));
class SlackService {
    client = null;
    constructor() {
        this.initialize();
    }
    initialize() {
        const botToken = index_js_1.config.slack.botToken;
        if (!botToken) {
            console.warn('Slack bot token not configured. Slack integration will be disabled.');
            return;
        }
        try {
            this.client = new web_api_1.WebClient(botToken, {
                logLevel: index_js_1.config.nodeEnv === 'development' ? web_api_1.LogLevel.DEBUG : web_api_1.LogLevel.WARN,
            });
        }
        catch (error) {
            console.error('Failed to initialize Slack client:', error);
        }
    }
    isAvailable() {
        return this.client !== null;
    }
    getClientForUser(accessToken) {
        return new web_api_1.WebClient(accessToken);
    }
    async testConnection() {
        if (!this.isAvailable())
            return false;
        try {
            const result = await this.client.auth.test();
            return result.ok === true;
        }
        catch (error) {
            console.error('Slack connection test failed:', error);
            return false;
        }
    }
    async listChannels(accessToken) {
        const client = accessToken ? this.getClientForUser(accessToken) : this.client;
        if (!client)
            throw new Error('Slack client not available');
        try {
            const result = await client.conversations.list({
                types: 'public_channel,private_channel',
                exclude_archived: true,
            });
            return (result.channels || []).map((channel) => ({
                id: channel.id,
                name: channel.name,
                isPrivate: channel.is_private || false,
            }));
        }
        catch (error) {
            console.error('Error listing Slack channels:', error);
            throw new Error('Failed to list Slack channels');
        }
    }
    async sendMessage(message, accessToken) {
        const client = accessToken ? this.getClientForUser(accessToken) : this.client;
        if (!client)
            throw new Error('Slack client not available');
        try {
            const result = await client.chat.postMessage({
                channel: message.channel,
                text: message.text,
                blocks: message.blocks,
                thread_ts: message.threadTs,
            });
            return result.ts;
        }
        catch (error) {
            console.error('Error sending Slack message:', error);
            throw new Error('Failed to send Slack message');
        }
    }
    async sendTaskNotification(userId, data) {
        // Get user's Slack integration
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'slack',
            status: 'connected',
            isActive: true,
        });
        if (!integration || !integration.slackConfig?.channelId) {
            return; // User doesn't have Slack connected or no channel configured
        }
        // Check notification settings
        const { slackConfig } = integration;
        const shouldNotify = this.shouldNotify(data.action, slackConfig);
        if (!shouldNotify || !slackConfig?.channelId)
            return;
        const blocks = this.buildTaskNotificationBlocks(data);
        const text = this.buildTaskNotificationText(data);
        try {
            await this.sendMessage({
                channel: slackConfig.channelId,
                text,
                blocks,
            }, integration.accessToken);
        }
        catch (error) {
            console.error('Failed to send Slack notification:', error);
        }
    }
    shouldNotify(action, config) {
        switch (action) {
            case 'created':
                return config.notifyOnTaskCreated;
            case 'completed':
                return config.notifyOnTaskCompleted;
            case 'commented':
                return config.notifyOnComment;
            default:
                return true;
        }
    }
    buildTaskNotificationText(data) {
        switch (data.action) {
            case 'created':
                return `📝 New task created: ${data.taskTitle} in ${data.projectName}`;
            case 'completed':
                return `✅ Task completed: ${data.taskTitle} by ${data.performedBy}`;
            case 'assigned':
                return `👤 Task assigned: ${data.taskTitle} to ${data.assignedTo}`;
            case 'commented':
                return `💬 New comment on: ${data.taskTitle}`;
            default:
                return `📌 Task updated: ${data.taskTitle}`;
        }
    }
    buildTaskNotificationBlocks(data) {
        const emoji = this.getActionEmoji(data.action);
        const actionText = this.getActionText(data.action);
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `${emoji} ${actionText}`,
                    emoji: true,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*<${data.taskUrl}|${data.taskTitle}>*`,
                },
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `📁 *Project:* ${data.projectName}`,
                    },
                    {
                        type: 'mrkdwn',
                        text: `👤 *By:* ${data.performedBy}`,
                    },
                ],
            },
        ];
        if (data.description) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: data.description.length > 200
                        ? data.description.substring(0, 197) + '...'
                        : data.description,
                },
            });
        }
        const fields = [];
        if (data.priority) {
            fields.push({
                type: 'mrkdwn',
                text: `*Priority:* ${this.formatPriority(data.priority)}`,
            });
        }
        if (data.dueDate) {
            fields.push({
                type: 'mrkdwn',
                text: `*Due:* ${data.dueDate.toLocaleDateString()}`,
            });
        }
        if (data.assignedTo) {
            fields.push({
                type: 'mrkdwn',
                text: `*Assigned to:* ${data.assignedTo}`,
            });
        }
        if (fields.length > 0) {
            blocks.push({
                type: 'section',
                fields,
            });
        }
        blocks.push({
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'View Task',
                        emoji: true,
                    },
                    url: data.taskUrl,
                    action_id: 'view_task',
                },
            ],
        });
        return blocks;
    }
    getActionEmoji(action) {
        const emojis = {
            created: '📝',
            completed: '✅',
            updated: '🔄',
            assigned: '👤',
            commented: '💬',
        };
        return emojis[action] || '📌';
    }
    getActionText(action) {
        const texts = {
            created: 'New Task Created',
            completed: 'Task Completed',
            updated: 'Task Updated',
            assigned: 'Task Assigned',
            commented: 'New Comment',
        };
        return texts[action] || 'Task Updated';
    }
    formatPriority(priority) {
        const priorities = {
            urgent: '🔴 Urgent',
            high: '🟠 High',
            medium: '🟡 Medium',
            low: '🟢 Low',
        };
        return priorities[priority] || priority;
    }
    async sendMentionNotification(userId, mentionedBy, taskTitle, taskUrl, comment) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'slack',
            status: 'connected',
            isActive: true,
        });
        if (!integration || !integration.slackConfig?.notifyOnMention) {
            return;
        }
        const channelId = integration.slackConfig.channelId;
        if (!channelId)
            return;
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '👋 You were mentioned!',
                    emoji: true,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${mentionedBy}* mentioned you in *<${taskUrl}|${taskTitle}>*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `> ${comment.length > 300 ? comment.substring(0, 297) + '...' : comment}`,
                },
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'View Comment',
                            emoji: true,
                        },
                        url: taskUrl,
                        action_id: 'view_comment',
                    },
                ],
            },
        ];
        try {
            await this.sendMessage({
                channel: channelId,
                text: `${mentionedBy} mentioned you in ${taskTitle}`,
                blocks,
            }, integration.accessToken);
        }
        catch (error) {
            console.error('Failed to send mention notification to Slack:', error);
        }
    }
    async sendDueDateReminder(userId, tasks) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'slack',
            status: 'connected',
            isActive: true,
        });
        if (!integration || !integration.slackConfig?.notifyOnDueDate) {
            return;
        }
        const channelId = integration.slackConfig.channelId;
        if (!channelId || tasks.length === 0)
            return;
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '⏰ Tasks Due Soon',
                    emoji: true,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `You have *${tasks.length}* task${tasks.length > 1 ? 's' : ''} due soon:`,
                },
            },
            { type: 'divider' },
        ];
        tasks.slice(0, 5).forEach((task) => {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*<${task.url}|${task.title}>*\n📁 ${task.project} • Due: ${task.dueDate.toLocaleDateString()}`,
                },
                accessory: {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'View',
                        emoji: true,
                    },
                    url: task.url,
                    action_id: `view_task_${Math.random().toString(36).substr(2, 9)}`,
                },
            });
        });
        if (tasks.length > 5) {
            blocks.push({
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `_And ${tasks.length - 5} more..._`,
                    },
                ],
            });
        }
        try {
            await this.sendMessage({
                channel: channelId,
                text: `You have ${tasks.length} tasks due soon`,
                blocks,
            }, integration.accessToken);
        }
        catch (error) {
            console.error('Failed to send due date reminder to Slack:', error);
        }
    }
}
exports.slackService = new SlackService();
exports.default = exports.slackService;
//# sourceMappingURL=slackService.js.map