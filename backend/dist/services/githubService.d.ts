import mongoose from 'mongoose';
interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    description?: string;
    url: string;
}
interface GitHubIssue {
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed';
    labels: string[];
    assignees: string[];
    url: string;
}
interface GitHubPullRequest {
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed' | 'merged';
    base: string;
    head: string;
    url: string;
    merged: boolean;
}
interface LinkedTaskInfo {
    taskId: string;
    taskNumber?: string;
}
declare class GitHubService {
    private getOctokit;
    getUserRepos(userId: mongoose.Types.ObjectId): Promise<GitHubRepo[]>;
    getRepoIssues(userId: mongoose.Types.ObjectId, owner: string, repo: string, options?: {
        state?: 'open' | 'closed' | 'all';
        labels?: string;
    }): Promise<GitHubIssue[]>;
    createIssueFromTask(userId: mongoose.Types.ObjectId, owner: string, repo: string, taskData: {
        title: string;
        description?: string;
        labels?: string[];
        assignees?: string[];
    }): Promise<GitHubIssue>;
    closeIssue(userId: mongoose.Types.ObjectId, owner: string, repo: string, issueNumber: number): Promise<void>;
    getPullRequests(userId: mongoose.Types.ObjectId, owner: string, repo: string, options?: {
        state?: 'open' | 'closed' | 'all';
    }): Promise<GitHubPullRequest[]>;
    addComment(userId: mongoose.Types.ObjectId, owner: string, repo: string, issueNumber: number, body: string): Promise<void>;
    parseTaskReferences(text: string): LinkedTaskInfo[];
    linkRepository(userId: mongoose.Types.ObjectId, repoId: number, repoFullName: string, projectId: mongoose.Types.ObjectId): Promise<void>;
    unlinkRepository(userId: mongoose.Types.ObjectId, repoId: number): Promise<void>;
    getCommitsForTask(userId: mongoose.Types.ObjectId, owner: string, repo: string, taskNumber: string, since?: Date): Promise<Array<{
        sha: string;
        message: string;
        author: string;
        date: Date;
        url: string;
    }>>;
    getAuthorizationUrl(state: string): string;
    exchangeCodeForToken(code: string): Promise<{
        accessToken: string;
        scope: string;
    }>;
    getAuthenticatedUser(accessToken: string): Promise<{
        id: number;
        login: string;
        name: string;
        email: string;
        avatarUrl: string;
    }>;
}
export declare const githubService: GitHubService;
export default githubService;
//# sourceMappingURL=githubService.d.ts.map