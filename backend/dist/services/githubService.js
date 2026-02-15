"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubService = void 0;
const rest_1 = require("@octokit/rest");
const index_js_1 = require("../config/index.js");
const Integration_js_1 = __importDefault(require("../models/Integration.js"));
class GitHubService {
    async getOctokit(userId) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'github',
            status: 'connected',
            isActive: true,
        });
        if (!integration) {
            return null;
        }
        // Check if token needs refresh by checking tokenExpiresAt
        if (integration.tokenExpiresAt && new Date() > new Date(integration.tokenExpiresAt)) {
            // Token refresh would happen here - for now just use existing token
            console.warn('GitHub token may be expired');
        }
        return new rest_1.Octokit({
            auth: integration.accessToken,
        });
    }
    // Get user's repositories
    async getUserRepos(userId) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            const { data } = await octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
            });
            return data.map((repo) => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                private: repo.private,
                description: repo.description || undefined,
                url: repo.html_url,
            }));
        }
        catch (error) {
            console.error('Failed to fetch GitHub repos:', error);
            throw new Error('Failed to fetch repositories');
        }
    }
    // Get repository issues
    async getRepoIssues(userId, owner, repo, options) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            const { data } = await octokit.issues.listForRepo({
                owner,
                repo,
                state: options?.state || 'open',
                labels: options?.labels,
                per_page: 100,
            });
            // Filter out pull requests (GitHub API returns PRs as issues)
            return data
                .filter((issue) => !issue.pull_request)
                .map((issue) => ({
                number: issue.number,
                title: issue.title,
                body: issue.body || undefined,
                state: issue.state,
                labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name || '')),
                assignees: issue.assignees?.map((a) => a.login) || [],
                url: issue.html_url,
            }));
        }
        catch (error) {
            console.error('Failed to fetch GitHub issues:', error);
            throw new Error('Failed to fetch issues');
        }
    }
    // Create an issue from a task
    async createIssueFromTask(userId, owner, repo, taskData) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            const { data } = await octokit.issues.create({
                owner,
                repo,
                title: taskData.title,
                body: taskData.description,
                labels: taskData.labels,
                assignees: taskData.assignees,
            });
            return {
                number: data.number,
                title: data.title,
                body: data.body || undefined,
                state: data.state,
                labels: data.labels.map((l) => (typeof l === 'string' ? l : l.name || '')),
                assignees: data.assignees?.map((a) => a.login) || [],
                url: data.html_url,
            };
        }
        catch (error) {
            console.error('Failed to create GitHub issue:', error);
            throw new Error('Failed to create issue');
        }
    }
    // Close an issue (when task is completed)
    async closeIssue(userId, owner, repo, issueNumber) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            await octokit.issues.update({
                owner,
                repo,
                issue_number: issueNumber,
                state: 'closed',
            });
        }
        catch (error) {
            console.error('Failed to close GitHub issue:', error);
            throw new Error('Failed to close issue');
        }
    }
    // Get pull requests
    async getPullRequests(userId, owner, repo, options) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            const { data } = await octokit.pulls.list({
                owner,
                repo,
                state: options?.state || 'open',
                per_page: 100,
            });
            return data.map((pr) => ({
                number: pr.number,
                title: pr.title,
                body: pr.body || undefined,
                state: pr.merged_at ? 'merged' : pr.state,
                base: pr.base.ref,
                head: pr.head.ref,
                url: pr.html_url,
                merged: !!pr.merged_at,
            }));
        }
        catch (error) {
            console.error('Failed to fetch pull requests:', error);
            throw new Error('Failed to fetch pull requests');
        }
    }
    // Add a comment to an issue/PR
    async addComment(userId, owner, repo, issueNumber, body) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            await octokit.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body,
            });
        }
        catch (error) {
            console.error('Failed to add GitHub comment:', error);
            throw new Error('Failed to add comment');
        }
    }
    // Parse task references from commit messages or PR descriptions
    // Supports formats like: #123, TASK-123, fixes #123, closes #123
    parseTaskReferences(text) {
        const taskRefs = [];
        // Match patterns like #123, TASK-123, closes #123, fixes TASK-123
        const patterns = [
            /(?:closes?|fixes?|resolves?|refs?)?\s*#(\d+)/gi,
            /(?:closes?|fixes?|resolves?|refs?)?\s*TASK-(\w+)/gi,
        ];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                taskRefs.push({
                    taskId: match[1],
                    taskNumber: match[1],
                });
            }
        }
        return taskRefs;
    }
    // Link repository to project
    async linkRepository(userId, repoId, repoFullName, projectId) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'github',
            status: 'connected',
        });
        if (!integration || !integration.githubConfig) {
            throw new Error('GitHub integration not found');
        }
        // Check if repo already linked
        const existingLink = integration.githubConfig.linkedRepositories.find((r) => r.repoId === repoId);
        if (existingLink) {
            existingLink.projectId = projectId;
        }
        else {
            integration.githubConfig.linkedRepositories.push({
                repoId,
                repoFullName,
                projectId,
            });
        }
        await integration.save();
    }
    // Unlink repository from project
    async unlinkRepository(userId, repoId) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'github',
            status: 'connected',
        });
        if (!integration || !integration.githubConfig) {
            throw new Error('GitHub integration not found');
        }
        integration.githubConfig.linkedRepositories = integration.githubConfig.linkedRepositories.filter((r) => r.repoId !== repoId);
        await integration.save();
    }
    // Get commits mentioning a task
    async getCommitsForTask(userId, owner, repo, taskNumber, since) {
        const octokit = await this.getOctokit(userId);
        if (!octokit) {
            throw new Error('GitHub integration not connected');
        }
        try {
            const { data } = await octokit.repos.listCommits({
                owner,
                repo,
                since: since?.toISOString(),
                per_page: 100,
            });
            // Filter commits that mention the task
            const taskPatterns = [
                new RegExp(`#${taskNumber}\\b`, 'i'),
                new RegExp(`TASK-${taskNumber}\\b`, 'i'),
            ];
            return data
                .filter((commit) => taskPatterns.some((pattern) => pattern.test(commit.commit.message)))
                .map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name || commit.author?.login || 'Unknown',
                date: new Date(commit.commit.author?.date || Date.now()),
                url: commit.html_url,
            }));
        }
        catch (error) {
            console.error('Failed to get commits:', error);
            throw new Error('Failed to get commits');
        }
    }
    // OAuth flow helpers
    getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_id: index_js_1.config.github.clientId,
            redirect_uri: index_js_1.config.github.callbackUrl,
            scope: 'repo read:user user:email',
            state,
        });
        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }
    async exchangeCodeForToken(code) {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: index_js_1.config.github.clientId,
                client_secret: index_js_1.config.github.clientSecret,
                code,
            }),
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error_description || 'Failed to exchange code for token');
        }
        return {
            accessToken: data.access_token || '',
            scope: data.scope || '',
        };
    }
    async getAuthenticatedUser(accessToken) {
        const octokit = new rest_1.Octokit({ auth: accessToken });
        const { data: user } = await octokit.users.getAuthenticated();
        // Get primary email
        let email = user.email || '';
        if (!email) {
            const { data: emails } = await octokit.users.listEmailsForAuthenticatedUser();
            const primaryEmail = emails.find((e) => e.primary);
            email = primaryEmail?.email || emails[0]?.email || '';
        }
        return {
            id: user.id,
            login: user.login,
            name: user.name || user.login,
            email,
            avatarUrl: user.avatar_url,
        };
    }
}
exports.githubService = new GitHubService();
exports.default = exports.githubService;
//# sourceMappingURL=githubService.js.map