"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUsersByDepartment = exports.assignTeamMember = exports.getTeamMembers = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const User_js_1 = require("../models/User.js");
const index_js_1 = require("../config/index.js");
// Get all users (with role-based filtering)
const getAllUsers = async (req, res) => {
    try {
        const currentUser = req.user;
        const userRole = currentUser.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        let query = { isActive: true };
        // Filter based on role
        if (userLevel < index_js_1.ROLE_HIERARCHY.manager) {
            // Team leads can only see their team members
            if (userRole === 'team_lead') {
                query.$or = [
                    { _id: currentUser._id },
                    { managerId: currentUser._id },
                ];
            }
            else {
                // Employees can only see themselves and colleagues in same department
                query.department = currentUser.department;
            }
        }
        const { department, role, search } = req.query;
        if (department)
            query.department = department;
        if (role)
            query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User_js_1.User.find(query)
            .select('-password')
            .sort({ name: 1 });
        res.json({ data: users });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_js_1.User.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};
exports.getUserById = getUserById;
// Update user (Admin only, or manager can update their team)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const { name, email, role, department, managerId, isActive, capacity } = req.body;
        // Check permissions
        const targetUser = await User_js_1.User.findById(id);
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Only admin can change roles
        if (role && role !== targetUser.role && currentUser.role !== 'admin') {
            res.status(403).json({ message: 'Only admins can change user roles' });
            return;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        if (department)
            updateData.department = department;
        if (managerId !== undefined)
            updateData.managerId = managerId;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (capacity !== undefined)
            updateData.capacity = capacity;
        const user = await User_js_1.User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select('-password');
        res.json({
            message: 'User updated successfully',
            user,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};
exports.updateUser = updateUser;
// Delete user (Admin only - soft delete)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_js_1.User.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deactivated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
exports.deleteUser = deleteUser;
// Get team members (for managers/team leads)
const getTeamMembers = async (req, res) => {
    try {
        const currentUser = req.user;
        const teamMembers = await User_js_1.User.find({
            managerId: currentUser._id,
            isActive: true,
        }).select('-password');
        res.json({ teamMembers });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching team members', error: error.message });
    }
};
exports.getTeamMembers = getTeamMembers;
// Assign team member to manager/lead
const assignTeamMember = async (req, res) => {
    try {
        const { managerId, memberId } = req.body;
        const manager = await User_js_1.User.findById(managerId);
        const member = await User_js_1.User.findById(memberId);
        if (!manager || !member) {
            res.status(404).json({ message: 'Manager or member not found' });
            return;
        }
        // Update member's managerId
        member.managerId = managerId;
        await member.save();
        // Add to manager's teamMembers array
        if (!manager.teamMembers.includes(memberId)) {
            manager.teamMembers.push(memberId);
            await manager.save();
        }
        res.json({ message: 'Team member assigned successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error assigning team member', error: error.message });
    }
};
exports.assignTeamMember = assignTeamMember;
// Get users by department
const getUsersByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const users = await User_js_1.User.find({
            department,
            isActive: true,
        }).select('-password');
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};
exports.getUsersByDepartment = getUsersByDepartment;
// Create user (Admin/Manager invitation)
const createUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { name, email, password, role, department } = req.body;
        // Check if user already exists
        const existingUser = await User_js_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
        // Only admin can create admin/manager users
        if ((role === 'admin' || role === 'manager') && currentUser.role !== 'admin') {
            res.status(403).json({ message: 'Only admins can create admin or manager users' });
            return;
        }
        const user = new User_js_1.User({
            name,
            email,
            password,
            role: role || 'employee',
            department: department || currentUser.department || 'Engineering',
            managerId: currentUser.role === 'manager' ? currentUser._id : undefined,
        });
        await user.save();
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};
exports.createUser = createUser;
//# sourceMappingURL=userController.js.map