"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.sendProjectAddedEmail = exports.sendMessageNotificationEmail = exports.sendEmail = exports.sendPasswordResetEmail = exports.sendCommentNotificationEmail = exports.sendTaskUpdateEmail = exports.sendTaskAssignmentEmail = exports.verifyEmailConnection = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_js_1 = require("../config/index.js");
// Create transporter
const transporter = nodemailer_1.default.createTransport({
    host: index_js_1.config.email.host,
    port: index_js_1.config.email.port,
    secure: false,
    auth: {
        user: index_js_1.config.email.user,
        pass: index_js_1.config.email.pass,
    },
});
// Verify connection
const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email service connected');
        return true;
    }
    catch (error) {
        console.error('⚠️ Email service not configured:', error);
        return false;
    }
};
exports.verifyEmailConnection = verifyEmailConnection;
// Send task assignment notification
const sendTaskAssignmentEmail = async (assignee, task, assignedBy, projectName) => {
    if (!assignee.emailNotifications) {
        console.log(`Email notifications disabled for ${assignee.email}`);
        return false;
    }
    const priorityColors = {
        urgent: '#ef4444',
        high: '#f97316',
        medium: '#3b82f6',
        low: '#6b7280',
    };
    const statusLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        review: 'Review',
        done: 'Done',
    };
    const priorityEmoji = {
        urgent: '🔴',
        high: '🟠',
        medium: '🔵',
        low: '⚪',
    };
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : 'Not set';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Assigned</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📋 New Task Assigned
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                ${assignedBy.name} has assigned you a new task
              </p>
            </td>
          </tr>
          
          <!-- Task Details -->
          <tr>
            <td style="padding: 40px;">
              <!-- Task Code & Priority -->
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <span style="background-color: #f1f5f9; color: #64748b; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-family: monospace; margin-right: 10px;">
                  ${task.code}
                </span>
                <span style="background-color: ${priorityColors[task.priority]}20; color: ${priorityColors[task.priority]}; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                  ${priorityEmoji[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              </div>
              
              <!-- Task Title -->
              <h2 style="margin: 0 0 15px 0; color: #18181b; font-size: 22px; font-weight: 600; line-height: 1.4;">
                ${task.title}
              </h2>
              
              <!-- Task Description -->
              <p style="margin: 0 0 25px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
                ${task.description || 'No description provided'}
              </p>
              
              <!-- Task Info Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7; width: 50%;">
                    <p style="margin: 0 0 4px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Project</p>
                    <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 500;">📁 ${projectName}</p>
                  </td>
                  <td style="padding: 16px 20px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7; width: 50%;">
                    <p style="margin: 0 0 4px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
                    <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 500;">${statusLabels[task.status]}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; width: 50%;">
                    <p style="margin: 0 0 4px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</p>
                    <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 500;">📅 ${dueDate}</p>
                  </td>
                  <td style="padding: 16px 20px; width: 50%;">
                    <p style="margin: 0 0 4px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Time Estimate</p>
                    <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 500;">⏱️ ${task.timeEstimate}h</p>
                  </td>
                </tr>
              </table>
              
              <!-- Labels -->
              ${task.labels && task.labels.length > 0 ? `
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Labels</p>
                <div>
                  ${task.labels.map((label) => `
                    <span style="display: inline-block; background-color: ${label.color}20; color: ${label.color}; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-right: 8px;">
                      ${label.name}
                    </span>
                  `).join('')}
                </div>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <div style="margin-top: 30px; text-align: center;">
                <a href="${index_js_1.config.urls.frontend}/tasks/${task._id}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                  View Task Details →
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 25px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #71717a; font-size: 13px; text-align: center;">
                This email was sent from Loom Project Management.<br>
                You can manage your notification preferences in your <a href="${index_js_1.config.urls.frontend}/settings" style="color: #6366f1; text-decoration: none;">settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    const textContent = `
New Task Assigned

Hi ${assignee.name},

${assignedBy.name} has assigned you a new task.

Task: ${task.code} - ${task.title}
Priority: ${task.priority}
Project: ${projectName}
Due Date: ${dueDate}
Time Estimate: ${task.timeEstimate}h

Description:
${task.description || 'No description provided'}

View task: ${index_js_1.config.urls.frontend}/tasks/${task._id}

---
Loom Project Management
  `;
    try {
        await transporter.sendMail({
            from: `"Loom Project" <${index_js_1.config.email.from}>`,
            to: assignee.email,
            subject: `📋 New Task Assigned: ${task.title}`,
            text: textContent,
            html: htmlContent,
        });
        console.log(`✅ Task assignment email sent to ${assignee.email}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${assignee.email}:`, error);
        return false;
    }
};
exports.sendTaskAssignmentEmail = sendTaskAssignmentEmail;
// Send task update notification
const sendTaskUpdateEmail = async (user, task, updatedBy, updateType, oldValue, newValue) => {
    if (!user.emailNotifications) {
        return false;
    }
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Task Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🔄 Task Updated
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                ${updatedBy.name} updated a task you're assigned to
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 15px 0; color: #18181b; font-size: 20px;">${task.code}: ${task.title}</h2>
              <p style="margin: 0 0 20px 0; color: #52525b; font-size: 15px;">
                <strong>Update:</strong> ${updateType}
              </p>
              ${oldValue && newValue ? `
              <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #71717a; font-size: 13px;">Changed from <s>${oldValue}</s> → <strong style="color: #18181b;">${newValue}</strong></p>
              </div>
              ` : ''}
              <div style="text-align: center;">
                <a href="${index_js_1.config.urls.frontend}/tasks/${task._id}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600;">
                  View Task →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    try {
        await transporter.sendMail({
            from: `"Loom Project" <${index_js_1.config.email.from}>`,
            to: user.email,
            subject: `🔄 Task Updated: ${task.title}`,
            html: htmlContent,
        });
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to send update email to ${user.email}:`, error);
        return false;
    }
};
exports.sendTaskUpdateEmail = sendTaskUpdateEmail;
// Send comment notification
const sendCommentNotificationEmail = async (user, task, commenter, comment) => {
    if (!user.emailNotifications) {
        return false;
    }
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Comment</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                💬 New Comment
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                ${commenter.name} commented on ${task.code}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 15px 0; color: #18181b; font-size: 20px;">${task.title}</h2>
              <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; margin-bottom: 25px;">
                <p style="margin: 0; color: #18181b; font-size: 15px; line-height: 1.6; font-style: italic;">
                  "${comment}"
                </p>
              </div>
              <div style="text-align: center;">
                <a href="${index_js_1.config.urls.frontend}/tasks/${task._id}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600;">
                  Reply to Comment →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    try {
        await transporter.sendMail({
            from: `"Loom Project" <${index_js_1.config.email.from}>`,
            to: user.email,
            subject: `💬 New Comment on ${task.code}: ${task.title}`,
            html: htmlContent,
        });
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to send comment email to ${user.email}:`, error);
        return false;
    }
};
exports.sendCommentNotificationEmail = sendCommentNotificationEmail;
// Send password reset email
const sendPasswordResetEmail = async (email, name, resetUrl) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🔐 Password Reset Request
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                We received a request to reset your password
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #18181b; font-size: 16px;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 25px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password for your Loom Project account. 
                Click the button below to create a new password.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
                  Reset Password
                </a>
              </div>
              <p style="margin: 25px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong> for security reasons.
              </p>
              <p style="margin: 15px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If you didn't request this password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; padding: 25px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #71717a; font-size: 13px; text-align: center;">
                This email was sent from Loom Project Management.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    const textContent = `
Password Reset Request

Hi ${name},

We received a request to reset your password for your Loom Project account.

Click this link to reset your password: ${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

---
Loom Project Management
  `;
    try {
        await transporter.sendMail({
            from: `"Loom Project" <${index_js_1.config.email.from}>`,
            to: email,
            subject: '🔐 Reset Your Password - Loom Project',
            text: textContent,
            html: htmlContent,
        });
        console.log(`✅ Password reset email sent to ${email}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to send password reset email to ${email}:`, error);
        return false;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendEmail = async (options) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@loomproject.com',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        return true;
    }
    catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
// Notify recipient about a new direct/team message
const sendMessageNotificationEmail = async (recipient, sender, content, conversation) => {
    if (!recipient.emailNotifications)
        return false;
    const preview = content.slice(0, 160);
    const link = `${index_js_1.config.urls.frontend}/messages`;
    const text = `You have a new message from ${sender.name}\n\n${preview}\n\nOpen: ${link}`;
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background:#f8fafc; padding:24px;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 6px 18px rgba(15,23,42,0.08);">
    <h2 style="margin:0 0 12px 0; color:#0f172a;">New message from ${sender.name}</h2>
    <p style="margin:0 0 16px 0; color:#475569;">${preview}</p>
    <a href="${link}" style="display:inline-block; padding:12px 18px; background:#6366f1; color:#fff; text-decoration:none; border-radius:10px; font-weight:600;">Open messages</a>
  </div>
</body>
</html>`;
    try {
        await transporter.sendMail({
            from: `Loom Project <${index_js_1.config.email.from}>`,
            to: recipient.email,
            subject: `New message from ${sender.name}`,
            text,
            html,
        });
        return true;
    }
    catch (error) {
        console.error('Failed to send message email:', error);
        return false;
    }
};
exports.sendMessageNotificationEmail = sendMessageNotificationEmail;
// Notify a user they were added to a project
const sendProjectAddedEmail = async (recipient, addedBy, project) => {
    if (!recipient.emailNotifications)
        return false;
    const link = `${index_js_1.config.urls.frontend}/projects/${project._id}`;
    const text = `You've been added to a project\n\nProject: ${project.name}\nAdded by: ${addedBy.name}\n\nOpen: ${link}`;
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background:#f8fafc; padding:24px;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 6px 18px rgba(15,23,42,0.08);">
    <h2 style="margin:0 0 12px 0; color:#0f172a;">You've been added to a project</h2>
    <p style="margin:0 0 8px 0; color:#475569; font-weight:600;">${project.name}</p>
    <p style="margin:0 0 16px 0; color:#64748b;">${addedBy.name} added you to this project.</p>
    <a href="${link}" style="display:inline-block; padding:12px 18px; background:#6366f1; color:#fff; text-decoration:none; border-radius:10px; font-weight:600;">Open project</a>
  </div>
</body>
</html>`;
    try {
        await transporter.sendMail({
            from: `Loom Project <${index_js_1.config.email.from}>`,
            to: recipient.email,
            subject: `Added to project: ${project.name}`,
            text,
            html,
        });
        return true;
    }
    catch (error) {
        console.error('Failed to send project email:', error);
        return false;
    }
};
exports.sendProjectAddedEmail = sendProjectAddedEmail;
// Wrapper object for backwards compatibility
exports.emailService = {
    sendEmail: exports.sendEmail,
    verifyEmailConnection: exports.verifyEmailConnection,
    sendTaskAssignmentEmail: exports.sendTaskAssignmentEmail,
    sendTaskUpdateEmail: exports.sendTaskUpdateEmail,
    sendCommentNotificationEmail: exports.sendCommentNotificationEmail,
    sendPasswordResetEmail: exports.sendPasswordResetEmail,
    sendMessageNotificationEmail: exports.sendMessageNotificationEmail,
    sendProjectAddedEmail: exports.sendProjectAddedEmail,
};
exports.default = exports.emailService;
//# sourceMappingURL=emailService.js.map