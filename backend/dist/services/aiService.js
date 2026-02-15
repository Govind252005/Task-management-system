"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const index_js_1 = require("../config/index.js");
class AIService {
    genAI = null;
    model = null;
    constructor() {
        this.initialize();
    }
    initialize() {
        const apiKey = index_js_1.config.geminiApiKey;
        if (!apiKey) {
            console.warn('Gemini API key not configured. AI features will be disabled.');
            return;
        }
        try {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                safetySettings: [
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                ],
            });
        }
        catch (error) {
            console.error('Failed to initialize Gemini AI:', error);
        }
    }
    isAvailable() {
        return this.model !== null;
    }
    async suggestTasks(context) {
        if (!this.isAvailable()) {
            throw new Error('AI service is not available');
        }
        const prompt = `You are a project management assistant. Based on the following project context, suggest 3-5 new tasks that would help move the project forward.

Project: ${context.projectName}
Description: ${context.projectDescription}

Existing Tasks:
${context.existingTasks.map((t) => `- ${t.title} (${t.status})`).join('\n')}

${context.recentActivity ? `Recent Activity:\n${context.recentActivity.join('\n')}` : ''}

Respond with a JSON array of task suggestions. Each suggestion should have:
- title: string (concise task title)
- description: string (detailed description)
- priority: "low" | "medium" | "high" | "urgent"
- estimatedHours: number (optional)
- suggestedLabels: string[] (optional)
- reason: string (why this task is suggested)

Return ONLY valid JSON array, no markdown formatting.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            // Clean up response - remove markdown code blocks if present
            const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanJson);
        }
        catch (error) {
            console.error('Error generating task suggestions:', error);
            throw new Error('Failed to generate task suggestions');
        }
    }
    async suggestSmartSchedule(context) {
        if (!this.isAvailable()) {
            throw new Error('AI service is not available');
        }
        const prompt = `You are a scheduling optimization assistant. Analyze the following tasks and team capacity to suggest optimal scheduling.

Tasks to Schedule:
${context.tasks.map((t) => `- ID: ${t.id}, Title: "${t.title}", Priority: ${t.priority}, Est Hours: ${t.estimatedHours || 'Unknown'}${t.dependencies?.length ? `, Dependencies: ${t.dependencies.join(', ')}` : ''}`).join('\n')}

Team Members:
${context.teamMembers.map((m) => `- ID: ${m.id}, Name: ${m.name}, Current Workload: ${m.currentWorkload}h${m.skills?.length ? `, Skills: ${m.skills.join(', ')}` : ''}`).join('\n')}

${context.sprintEndDate ? `Sprint End Date: ${context.sprintEndDate.toISOString()}` : ''}
${context.projectDeadline ? `Project Deadline: ${context.projectDeadline.toISOString()}` : ''}

Today's date: ${new Date().toISOString()}

Suggest scheduling for each task. Respond with a JSON array where each item has:
- taskId: string
- suggestedDueDate: string (ISO date)
- suggestedAssignee: string (member ID, optional)
- confidence: number (0-1)
- reasoning: string

Return ONLY valid JSON array, no markdown formatting.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const suggestions = JSON.parse(cleanJson);
            return suggestions.map((s) => ({
                ...s,
                suggestedDueDate: new Date(s.suggestedDueDate),
            }));
        }
        catch (error) {
            console.error('Error generating schedule suggestions:', error);
            throw new Error('Failed to generate schedule suggestions');
        }
    }
    async analyzeProductivity(context) {
        if (!this.isAvailable()) {
            throw new Error('AI service is not available');
        }
        const prompt = `You are a productivity analyst. Analyze the following user productivity data and provide actionable insights.

User: ${context.userName}
Time Period: ${context.timeRange.start.toISOString().split('T')[0]} to ${context.timeRange.end.toISOString().split('T')[0]}

Metrics:
- Tasks Completed: ${context.tasksCompleted}
- Tasks Created: ${context.tasksCreated}
- Average Completion Time: ${context.averageCompletionTime} hours
- On-Time Completion Rate: ${context.onTimeCompletionRate}%
${context.topLabels?.length ? `- Most Worked On: ${context.topLabels.join(', ')}` : ''}

${context.dailyActivity?.length ? `Daily Activity:\n${context.dailyActivity.map((d) => `- ${d.date.toISOString().split('T')[0]}: ${d.tasksCompleted} tasks, ${d.hoursWorked}h`).join('\n')}` : ''}

Provide 3-5 productivity insights. Each insight should have:
- type: "strength" | "improvement" | "trend" | "recommendation"
- title: string (brief title)
- description: string (detailed explanation)
- metrics: object (optional, key-value pairs)
- actionItems: string[] (optional, specific actions to take)

Return ONLY valid JSON array, no markdown formatting.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanJson);
        }
        catch (error) {
            console.error('Error analyzing productivity:', error);
            throw new Error('Failed to analyze productivity');
        }
    }
    async predictBurndown(context) {
        if (!this.isAvailable()) {
            throw new Error('AI service is not available');
        }
        const prompt = `You are a sprint planning analyst. Analyze the following burndown data and predict sprint completion.

Sprint: ${context.sprintName}
Duration: ${context.startDate.toISOString().split('T')[0]} to ${context.endDate.toISOString().split('T')[0]}
Total Story Points: ${context.totalPoints}
Completed Points: ${context.completedPoints}
Remaining Points: ${context.totalPoints - context.completedPoints}
Team Average Velocity: ${context.teamVelocity} points/day

Burndown History:
${context.dailyBurndown.map((d) => `- ${d.date.toISOString().split('T')[0]}: ${d.remainingPoints} points remaining`).join('\n')}

Today: ${new Date().toISOString().split('T')[0]}
Days Remaining: ${Math.ceil((context.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}

Analyze and predict:
- projectedCompletionDate: string (ISO date)
- onTrack: boolean
- riskLevel: "low" | "medium" | "high"
- recommendation: string (actionable advice)
- dailyVelocityNeeded: number (points per day needed to complete on time)

Return ONLY valid JSON object, no markdown formatting.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const prediction = JSON.parse(cleanJson);
            return {
                ...prediction,
                projectedCompletionDate: new Date(prediction.projectedCompletionDate),
            };
        }
        catch (error) {
            console.error('Error predicting burndown:', error);
            throw new Error('Failed to predict burndown');
        }
    }
    async generateTaskDescription(context) {
        if (!this.isAvailable()) {
            throw new Error('AI service is not available');
        }
        const prompt = `Generate a clear and detailed task description for the following task.

Task Title: ${context.title}
${context.projectContext ? `Project Context: ${context.projectContext}` : ''}
${context.additionalInfo ? `Additional Info: ${context.additionalInfo}` : ''}

Write a professional task description that includes:
1. What needs to be done
2. Acceptance criteria
3. Any relevant technical considerations

Keep it concise but comprehensive. Return only the description text, no JSON or formatting.`;
        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();
        }
        catch (error) {
            console.error('Error generating task description:', error);
            throw new Error('Failed to generate task description');
        }
    }
    async categorizeTask(context) {
        if (!this.isAvailable()) {
            throw new Error('AI service is not available');
        }
        const prompt = `Categorize the following task by selecting appropriate labels.

Task Title: ${context.title}
${context.description ? `Description: ${context.description}` : ''}

Available Labels: ${context.availableLabels.join(', ')}

Select 1-3 most relevant labels from the available options. Return ONLY a JSON array of label strings, no markdown formatting.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanJson);
        }
        catch (error) {
            console.error('Error categorizing task:', error);
            throw new Error('Failed to categorize task');
        }
    }
}
exports.aiService = new AIService();
exports.default = exports.aiService;
//# sourceMappingURL=aiService.js.map