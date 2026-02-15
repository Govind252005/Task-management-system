interface TaskSuggestion {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    suggestedLabels?: string[];
    reason: string;
}
interface SmartScheduleSuggestion {
    taskId: string;
    suggestedDueDate: Date;
    suggestedAssignee?: string;
    confidence: number;
    reasoning: string;
}
interface ProductivityInsight {
    type: 'strength' | 'improvement' | 'trend' | 'recommendation';
    title: string;
    description: string;
    metrics?: Record<string, number>;
    actionItems?: string[];
}
interface BurndownPrediction {
    projectedCompletionDate: Date;
    onTrack: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
    dailyVelocityNeeded?: number;
}
declare class AIService {
    private genAI;
    private model;
    constructor();
    private initialize;
    private isAvailable;
    suggestTasks(context: {
        projectName: string;
        projectDescription: string;
        existingTasks: Array<{
            title: string;
            status: string;
        }>;
        recentActivity?: string[];
    }): Promise<TaskSuggestion[]>;
    suggestSmartSchedule(context: {
        tasks: Array<{
            id: string;
            title: string;
            priority: string;
            estimatedHours?: number;
            dependencies?: string[];
        }>;
        teamMembers: Array<{
            id: string;
            name: string;
            currentWorkload: number;
            skills?: string[];
        }>;
        sprintEndDate?: Date;
        projectDeadline?: Date;
    }): Promise<SmartScheduleSuggestion[]>;
    analyzeProductivity(context: {
        userId: string;
        userName: string;
        timeRange: {
            start: Date;
            end: Date;
        };
        tasksCompleted: number;
        tasksCreated: number;
        averageCompletionTime: number;
        onTimeCompletionRate: number;
        topLabels?: string[];
        dailyActivity?: Array<{
            date: Date;
            tasksCompleted: number;
            hoursWorked: number;
        }>;
    }): Promise<ProductivityInsight[]>;
    predictBurndown(context: {
        sprintName: string;
        startDate: Date;
        endDate: Date;
        totalPoints: number;
        completedPoints: number;
        dailyBurndown: Array<{
            date: Date;
            remainingPoints: number;
        }>;
        teamVelocity: number;
    }): Promise<BurndownPrediction>;
    generateTaskDescription(context: {
        title: string;
        projectContext?: string;
        additionalInfo?: string;
    }): Promise<string>;
    categorizeTask(context: {
        title: string;
        description?: string;
        availableLabels: string[];
    }): Promise<string[]>;
}
export declare const aiService: AIService;
export default aiService;
//# sourceMappingURL=aiService.d.ts.map