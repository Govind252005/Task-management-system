"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./models/User");
const Project_1 = require("./models/Project");
const Task_1 = require("./models/Task");
const Sprint_1 = require("./models/Sprint");
const Label_1 = require("./models/Label");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loom-project';
const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        department: 'Engineering',
        notificationPreferences: {
            email: true,
            push: true,
            taskAssigned: true,
            taskUpdated: true,
            taskCompleted: true,
            mentioned: true,
            sprintStarted: true,
            sprintEnded: true,
        },
    },
    {
        name: 'John Manager',
        email: 'manager@example.com',
        password: 'manager123',
        role: 'manager',
        department: 'Engineering',
        notificationPreferences: {
            email: true,
            push: true,
            taskAssigned: true,
            taskUpdated: true,
            taskCompleted: true,
            mentioned: true,
            sprintStarted: true,
            sprintEnded: true,
        },
    },
    {
        name: 'Sarah Team Lead',
        email: 'teamlead@example.com',
        password: 'teamlead123',
        role: 'team_lead',
        department: 'Engineering',
        notificationPreferences: {
            email: true,
            push: true,
            taskAssigned: true,
            taskUpdated: true,
            taskCompleted: true,
            mentioned: true,
            sprintStarted: true,
            sprintEnded: true,
        },
    },
    {
        name: 'Mike Developer',
        email: 'employee@example.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        notificationPreferences: {
            email: true,
            push: true,
            taskAssigned: true,
            taskUpdated: true,
            taskCompleted: true,
            mentioned: true,
            sprintStarted: true,
            sprintEnded: true,
        },
    },
    {
        name: 'Emily Designer',
        email: 'designer@example.com',
        password: 'designer123',
        role: 'employee',
        department: 'Design',
        notificationPreferences: {
            email: true,
            push: true,
            taskAssigned: true,
            taskUpdated: true,
            taskCompleted: true,
            mentioned: true,
            sprintStarted: true,
            sprintEnded: true,
        },
    },
    {
        name: 'Viewer User',
        email: 'viewer@example.com',
        password: 'viewer123',
        role: 'viewer',
        department: 'Marketing',
        notificationPreferences: {
            email: true,
            push: false,
            taskAssigned: false,
            taskUpdated: true,
            taskCompleted: true,
            mentioned: true,
            sprintStarted: false,
            sprintEnded: false,
        },
    },
];
const labels = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#22c55e' },
    { name: 'Enhancement', color: '#3b82f6' },
    { name: 'Documentation', color: '#a855f7' },
    { name: 'High Priority', color: '#f97316' },
    { name: 'Low Priority', color: '#6b7280' },
    { name: 'Design', color: '#ec4899' },
    { name: 'Backend', color: '#14b8a6' },
    { name: 'Frontend', color: '#8b5cf6' },
    { name: 'Testing', color: '#eab308' },
];
async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            User_1.User.deleteMany({}),
            Project_1.Project.deleteMany({}),
            Task_1.Task.deleteMany({}),
            Sprint_1.Sprint.deleteMany({}),
            Label_1.Label.deleteMany({}),
        ]);
        // Create users
        console.log('Creating users...');
        const createdUsers = [];
        for (const userData of users) {
            // Don't hash password here - the User model pre-save hook will do it
            const user = await User_1.User.create({
                ...userData,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=8b5cf6&color=fff`,
            });
            createdUsers.push(user);
            console.log(`  Created user: ${userData.email} (${userData.role})`);
        }
        // Set manager relationships
        const admin = createdUsers.find(u => u.role === 'admin');
        const manager = createdUsers.find(u => u.role === 'manager');
        const teamLead = createdUsers.find(u => u.role === 'team_lead');
        const employees = createdUsers.filter(u => u.role === 'employee');
        if (manager && admin) {
            manager.managerId = admin._id;
            await manager.save();
        }
        if (teamLead && manager) {
            teamLead.managerId = manager._id;
            await teamLead.save();
        }
        for (const employee of employees) {
            if (teamLead) {
                employee.managerId = teamLead._id;
                await employee.save();
            }
        }
        // Create labels
        console.log('Creating labels...');
        const createdLabels = await Label_1.Label.insertMany(labels);
        console.log(`  Created ${createdLabels.length} labels`);
        // Create projects
        console.log('Creating projects...');
        const projects = [
            {
                name: 'Website Redesign',
                key: 'WR',
                description: 'Complete redesign of the company website with modern UI/UX',
                ownerId: admin?._id,
                teamLeadId: teamLead?._id,
                createdBy: admin?._id,
                members: createdUsers.slice(0, 4).map(u => u._id),
                visibility: 'team',
                status: 'active',
            },
            {
                name: 'Mobile App v2',
                key: 'MA',
                description: 'Development of version 2 of the mobile application',
                ownerId: manager?._id,
                teamLeadId: teamLead?._id,
                createdBy: manager?._id,
                members: createdUsers.slice(0, 5).map(u => u._id),
                visibility: 'public',
                status: 'active',
            },
            {
                name: 'API Integration',
                key: 'API',
                description: 'Integration with third-party APIs and services',
                ownerId: teamLead?._id,
                teamLeadId: teamLead?._id,
                createdBy: teamLead?._id,
                members: createdUsers.slice(2, 5).map(u => u._id),
                visibility: 'private',
                status: 'active',
            },
        ];
        const createdProjects = await Project_1.Project.insertMany(projects);
        console.log(`  Created ${createdProjects.length} projects`);
        // Create sprints
        console.log('Creating sprints...');
        const now = new Date();
        const sprintsData = [];
        for (const project of createdProjects) {
            sprintsData.push({
                name: `Sprint 1`,
                projectId: project._id,
                startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                goal: 'Complete initial setup and core features',
                status: 'completed',
            });
            sprintsData.push({
                name: `Sprint 2`,
                projectId: project._id,
                startDate: now,
                endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                goal: 'Implement main functionality and testing',
                status: 'active',
            });
            sprintsData.push({
                name: `Sprint 3`,
                projectId: project._id,
                startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
                goal: 'Polish and prepare for release',
                status: 'planned',
            });
        }
        const createdSprints = await Sprint_1.Sprint.insertMany(sprintsData);
        console.log(`  Created ${createdSprints.length} sprints`);
        // Create tasks
        console.log('Creating tasks...');
        const taskStatuses = ['todo', 'in_progress', 'review', 'done'];
        const taskPriorities = ['urgent', 'high', 'medium', 'low'];
        const taskTypes = ['story', 'task', 'bug', 'epic'];
        const tasksData = [];
        let taskCounter = 0;
        for (const project of createdProjects) {
            const projectSprints = createdSprints.filter(s => s.projectId.toString() === project._id.toString());
            const activeSprint = projectSprints.find(s => s.status === 'active');
            for (let i = 0; i < 15; i++) {
                taskCounter++;
                const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
                const priority = taskPriorities[Math.floor(Math.random() * taskPriorities.length)];
                const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
                const assignee = createdUsers[Math.floor(Math.random() * (createdUsers.length - 1))];
                const reporter = createdUsers[Math.floor(Math.random() * 3)];
                const label = createdLabels[Math.floor(Math.random() * createdLabels.length)];
                tasksData.push({
                    code: `${project.key}-${taskCounter}`,
                    title: `${getTaskTitle(type, i)}`,
                    description: `This is a ${type} task for ${project.name}. It involves ${getTaskDescription(type)}.`,
                    projectId: project._id,
                    sprint: status !== 'todo' ? activeSprint?._id : undefined,
                    status,
                    priority,
                    assignees: [assignee._id],
                    reporter: reporter._id,
                    labels: [{ name: label.name, color: label.color }],
                    timeEstimate: Math.floor(Math.random() * 40) + 4,
                    timeLogged: Math.floor(Math.random() * 20),
                    dueDate: new Date(now.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                });
            }
        }
        await Task_1.Task.insertMany(tasksData);
        console.log(`  Created ${tasksData.length} tasks`);
        console.log('\n✅ Seed completed successfully!\n');
        console.log('Test accounts:');
        console.log('  Admin:     admin@example.com     / admin123');
        console.log('  Manager:   manager@example.com   / manager123');
        console.log('  Team Lead: teamlead@example.com  / teamlead123');
        console.log('  Employee:  employee@example.com  / employee123');
        console.log('  Designer:  designer@example.com  / designer123');
        console.log('  Viewer:    viewer@example.com    / viewer123');
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}
function getTaskTitle(type, index) {
    const titles = {
        story: [
            'Implement user authentication',
            'Create dashboard layout',
            'Add search functionality',
            'Design notification system',
            'Build settings page',
            'Create user profile',
            'Implement dark mode',
            'Add file upload feature',
            'Create project board view',
            'Build activity timeline',
            'Add commenting system',
            'Create reporting module',
            'Implement role permissions',
            'Build sprint planning view',
            'Add kanban board drag-drop',
        ],
        task: [
            'Update API endpoints',
            'Write unit tests',
            'Optimize database queries',
            'Configure CI/CD pipeline',
            'Update documentation',
            'Review pull requests',
            'Setup monitoring',
            'Configure caching',
            'Migrate database schema',
            'Update dependencies',
            'Setup logging',
            'Configure alerts',
            'Optimize build process',
            'Setup staging environment',
            'Configure backup system',
        ],
        bug: [
            'Fix login redirect issue',
            'Resolve memory leak',
            'Fix responsive layout',
            'Debug API timeout',
            'Fix date formatting',
            'Resolve permissions bug',
            'Fix image upload error',
            'Debug notification delay',
            'Fix pagination issue',
            'Resolve search indexing',
            'Fix session timeout',
            'Debug websocket disconnect',
            'Fix mobile scroll issue',
            'Resolve cache invalidation',
            'Fix email template rendering',
        ],
        epic: [
            'User Management System',
            'Project Dashboard Enhancement',
            'Mobile App Development',
            'API Modernization',
            'Security Improvements',
            'Performance Optimization',
            'Reporting System',
            'Integration Platform',
            'Analytics Dashboard',
            'Notification System Overhaul',
            'Search Enhancement',
            'UI/UX Refresh',
            'DevOps Automation',
            'Testing Infrastructure',
            'Documentation Revamp',
        ],
    };
    return titles[type][index % 15];
}
function getTaskDescription(type) {
    const descriptions = {
        story: 'implementing new features and user-facing functionality that deliver value to end users',
        task: 'completing technical work and maintenance activities to improve the codebase',
        bug: 'identifying and fixing issues that affect user experience or system functionality',
        epic: 'managing large initiatives that span multiple sprints and require coordination',
    };
    return descriptions[type] || 'completing assigned work items';
}
seed();
//# sourceMappingURL=seed.js.map