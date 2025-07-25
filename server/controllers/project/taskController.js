const Task = require("../../models/project/Task");
const Project = require("../../models/project/Project");
const UserEmployee = require("../../models/employeeManagement/UserEmployeeSchema");
const FCMToken = require("../../models/fcmToken");
const { getAdmin } = require("../../config/firebase");
const fs = require("fs");
const path = require("path");
const { createTaskNotification } = require("../../services/notificationService");

// Helper function to robustly parse the assignedTo field
function parseAssignedTo(data) {
  if (!data) {
    return [];
  }

  let currentData = data;

  // Handle cases where the data is a string that looks like an array
  if (typeof currentData === 'string') {
    // Attempt to remove outer brackets and quotes if they exist
    if (currentData.startsWith('"[') && currentData.endsWith(']"')) {
      currentData = currentData.substring(1, currentData.length - 1);
    }
     // First, try to parse it as a JSON string
    try {
      currentData = JSON.parse(currentData);
    } catch (e) {
      // If parsing fails, it might be a simple comma-separated string
      return currentData.split(',').map(id => id.trim()).filter(Boolean);
    }
  }
  
  // Recursively flatten and process the array
  if (Array.isArray(currentData)) {
    return currentData.flat().flatMap(parseAssignedTo);
  }

  return [String(currentData)];
}

// Helper function to map Employee IDs to UserEmployee IDs
async function mapEmployeeToUserEmployeeIds(employeeIds) {
  try {
    const Employee = require('../../models/employeeManagement/employeeSchema');
    const UserEmployee = require('../../models/employeeManagement/UserEmployeeSchema');
    
    const userEmployeeIds = [];
    
    for (const employeeId of employeeIds) {
      // Find the employee by ID
      const employee = await Employee.findById(employeeId);
      if (employee) {
        // Find the corresponding UserEmployee by email
        const userEmployee = await UserEmployee.findOne({ email: employee.email });
        if (userEmployee) {
          userEmployeeIds.push(userEmployee._id.toString());
          console.log(`Mapped Employee ID ${employeeId} (${employee.email}) to UserEmployee ID ${userEmployee._id}`);
        } else {
          console.log(`No UserEmployee found for Employee ID ${employeeId} (${employee.email})`);
        }
      } else {
        console.log(`No Employee found for ID ${employeeId}`);
      }
    }
    
    return userEmployeeIds;
  } catch (error) {
    console.error('Error mapping Employee IDs to UserEmployee IDs:', error);
    return [];
  }
}

// Helper function to convert all values to strings for FCM
function convertToFCMData(data) {
  const converted = {};
  for (const [key, value] of Object.entries(data)) {
    converted[key] = String(value);
  }
  return converted;
}

// Helper function to get all admin users
async function getAllAdminUsers() {
  try {
    const User = require('../../models/user');
    // Check for both isAdmin: true and admin roles
    const adminUsers = await User.find({
      $or: [
        { isAdmin: true },
        { role: { $in: ['admin', 'hotel admin', 'super admin'] } }
      ]
    });
    return adminUsers.map(user => user._id.toString());
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
}

// Helper function to get project assignees
async function getProjectAssignees(projectId) {
  try {
    const project = await Project.findById(projectId);
    if (!project || !project.assignedEmployees) {
      return [];
    }
    return project.assignedEmployees.map(emp => emp.toString());
  } catch (error) {
    console.error('Error getting project assignees:', error);
    return [];
  }
}

// Helper function to send FCM notifications to employees
async function sendTaskNotification(userIds, notification) {
  try {
    if (!userIds || userIds.length === 0) {
      console.log('No users to send notification to');
      return;
    }

    console.log('Original Employee IDs for notification:', userIds);
    
    // Map Employee IDs to UserEmployee IDs
    const userEmployeeIds = await mapEmployeeToUserEmployeeIds(userIds);
    
    if (userEmployeeIds.length === 0) {
      console.log('No UserEmployee IDs found for notification');
      return;
    }
    
    console.log('Mapped UserEmployee IDs for notification:', userEmployeeIds);

    // Save notifications to database first
    try {
      const savedNotifications = await createTaskNotification({
        userIds: userEmployeeIds,
        type: notification.type || 'task',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'medium',
        taskId: notification.taskId,
        projectId: notification.projectId,
        triggeredBy: notification.triggeredBy,
        triggeredByModel: notification.triggeredByModel
      });
      console.log(`Saved ${savedNotifications.length} notifications to database`);
    } catch (dbError) {
      console.error('Error saving notifications to database:', dbError);
      // Continue with FCM sending even if database save fails
    }

    const admin = getAdmin();

    // Get FCM tokens for the users (now using UserEmployee IDs)
    const tokens = await FCMToken.find({
      userId: { $in: userEmployeeIds },
      isActive: true,
    });

    if (tokens.length === 0) {
      console.log(`No active FCM tokens found for UserEmployee IDs: ${userEmployeeIds.join(', ')} (mapped from Employee IDs: ${userIds.join(', ')})`);
      return;
    }

    const tokenList = tokens.map(t => t.token);
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually
    for (const token of tokenList) {
      try {
        // Convert all data values to strings for FCM compatibility
        const fcmData = convertToFCMData({
          type: notification.type || 'task',
          taskId: notification.taskId || '',
          projectId: notification.projectId || '',
          ...notification.data,
        });

        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: fcmData,
          token: token,
        };

        await admin.messaging().send(message);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to token ${token}:`, error);
        failureCount++;
        
        // Remove failed token
        await FCMToken.deleteOne({ token });
      }
    }

    console.log(`Notification sent: ${successCount} successful, ${failureCount} failed`);

    if (failureCount > 0) {
      console.log(`Removed ${failureCount} failed FCM tokens`);
    }

    return {
      success: true,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('Error sending task notification:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to send FCM notifications to admin users
async function sendAdminNotification(adminUserIds, notification) {
  try {
    if (!adminUserIds || adminUserIds.length === 0) {
      console.log('No admin users to send notification to');
      return;
    }

    console.log('Admin User IDs for notification:', adminUserIds);

    // Save notifications to database first (admin users use User model IDs directly)
    try {
      const savedNotifications = await createTaskNotification({
        userIds: adminUserIds, // Admin users use User model IDs directly
        type: notification.type || 'task',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'medium',
        taskId: notification.taskId,
        projectId: notification.projectId,
        triggeredBy: notification.triggeredBy,
        triggeredByModel: notification.triggeredByModel
      });
      console.log(`Saved ${savedNotifications.length} admin notifications to database`);
    } catch (dbError) {
      console.error('Error saving admin notifications to database:', dbError);
      // Continue with FCM sending even if database save fails
    }

    const admin = getAdmin();

    // Get FCM tokens for admin users (using User IDs directly)
    const tokens = await FCMToken.find({
      userId: { $in: adminUserIds },
      isActive: true,
    });

    if (tokens.length === 0) {
      console.log(`No active FCM tokens found for Admin User IDs: ${adminUserIds.join(', ')}`);
      return;
    }

    const tokenList = tokens.map(t => t.token);
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually
    for (const token of tokenList) {
      try {
        // Convert all data values to strings for FCM compatibility
        const fcmData = convertToFCMData({
            type: notification.type || 'task',
            taskId: notification.taskId || '',
            projectId: notification.projectId || '',
            ...notification.data,
        });

        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: fcmData,
          token: token,
        };

        await admin.messaging().send(message);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to token ${token}:`, error);
        failureCount++;
        
        // Remove failed token
        await FCMToken.deleteOne({ token });
      }
    }

    console.log(`Admin notification sent: ${successCount} successful, ${failureCount} failed`);

    if (failureCount > 0) {
      console.log(`Removed ${failureCount} failed FCM tokens`);
    }

    return {
      success: true,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Task Controller
 * Handles all CRUD operations for tasks
 */

/**
 * @desc    Get all tasks for a project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private
 */
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate project ID
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Transform the tasks to include the full name
    const transformedTasks = tasks.map((task) => {
      const taskObj = task.toObject();
      if (
        taskObj.assignedTo &&
        taskObj.assignedTo.firstName &&
        taskObj.assignedTo.lastName
      ) {
        taskObj.assignedTo.name = `${taskObj.assignedTo.firstName} ${taskObj.assignedTo.lastName}`;
      }
      return taskObj;
    });

    res.status(200).json({
      success: true,
      count: transformedTasks.length,
      data: transformedTasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
};

/**
 * @desc    Get a single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Transform the task to include the full name
    const taskObj = task.toObject();
    if (
      taskObj.assignedTo &&
      taskObj.assignedTo.firstName &&
      taskObj.assignedTo.lastName
    ) {
      taskObj.assignedTo.name = `${taskObj.assignedTo.firstName} ${taskObj.assignedTo.lastName}`;
    }

    res.status(200).json({
      success: true,
      data: taskObj,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
    });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    console.log('🔧 Creating task with body:', req.body);
    console.log('🔧 User info:', req.user);
    
    const {
      projectId,
      title,
      comment,
      startDate,
      endDate,
      status = "new",
      assignedTo,
    } = req.body;

    // Validate required fields
    if (!projectId || !title || !startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (projectId, title, startDate)",
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Create task data
    const taskData = {
      projectId,
      title,
      comment: comment || "",
      startDate: new Date(startDate),
      status,
    };

    // Use the robust parser for assignedTo
    if (assignedTo) {
      const assignedArr = parseAssignedTo(assignedTo);
      if (assignedArr.length > 0) {
        taskData.assignedTo = assignedArr;
      }
    }

    // Add end date if provided and not empty
    if (endDate && endDate.trim() !== "") {
      taskData.endDate = new Date(endDate);
    }

    // Add file attachments if provided (handled by middleware)
    if (req.beforeAttachments && req.beforeAttachments.length > 0) {
      taskData.beforeAttachments = req.beforeAttachments;
    }

    if (req.afterAttachments && req.afterAttachments.length > 0) {
      taskData.afterAttachments = req.afterAttachments;
    }

    // Add general attachements if provided (handled by middleware)
    if (req.attachements && req.attachements.length > 0) {
      taskData.attachements = req.attachements;
    }

    // Create the task
    const task = await Task.create(taskData);

    // Update project task counts
    await updateProjectTaskCounts(projectId);

          // Send comprehensive notifications
      try {
        const currentUserId = req.user ? req.user.id : null;
        console.log('Current user ID:', currentUserId);
        console.log('Current user object:', req.user);
        
        // Get all notification recipients
        const taskAssignees = taskData.assignedTo || [];
        const projectAssignees = await getProjectAssignees(projectId);
        const adminUsers = await getAllAdminUsers();
        
        console.log('Task assignees:', taskAssignees);
        console.log('Project assignees:', projectAssignees);
        console.log('Admin users:', adminUsers);
        
        // Convert all IDs to strings for proper comparison
        const currentUserIdStr = currentUserId ? currentUserId.toString() : null;
        const taskAssigneesStr = taskAssignees.map(id => id.toString());
        const projectAssigneesStr = projectAssignees.map(id => id.toString());
        const adminUsersStr = adminUsers.map(id => id.toString());
        
        // Check if current user is admin (check both admin list and user role)
        const isCurrentUserAdmin = adminUsersStr.includes(currentUserIdStr) || 
          (req.user && (req.user.isAdmin || ['admin', 'hotel admin', 'super admin'].includes(req.user.role)));
        
        // Remove current user from all notification lists
        const taskAssigneeRecipients = taskAssigneesStr.filter(id => id !== currentUserIdStr);
        
        // Admin recipients logic: 
        // - If current user is admin: exclude admin from notifications
        // - If current user is not admin: include admin in notifications
        const adminRecipients = isCurrentUserAdmin 
          ? [] // Admin won't get notifications when they create/update
          : adminUsersStr.filter(id => id !== currentUserIdStr); // Non-admin users will notify admins
        
        console.log('Task assignee recipients (excluding current user):', taskAssigneeRecipients);
        console.log('Admin recipients (excluding current user):', adminRecipients);
        console.log('Is current user admin?', isCurrentUserAdmin);
      
      // Send task assignment notification to task assignees (excluding current user)
      if (taskAssigneeRecipients.length > 0) {
        await sendTaskNotification(taskAssigneeRecipients, {
          title: 'New Task Assigned',
          body: `You have been assigned a new task: "${title}" in project: ${project.customerName || 'Unknown Project'}`,
          type: 'task_assigned',
          taskId: task._id.toString(),
          projectId: projectId.toString(),
          triggeredBy: currentUserId,
          triggeredByModel: isCurrentUserAdmin ? 'User' : 'UserEmployee',
          data: {
            taskTitle: title,
            projectName: project.customerName || 'Unknown Project',
            assignedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            taskDetails: {
              title: title,
              comment: comment || '',
              status: status || 'new',
              startDate: startDate,
              endDate: endDate || null
            }
          },
        });
        console.log(`Task assignment notification sent to ${taskAssigneeRecipients.length} task assignees`);
      }
      
      // Send admin notification to admin users (excluding current user)
      if (adminRecipients.length > 0) {
        await sendAdminNotification(adminRecipients, {
          title: 'New Task Created',
          body: `A new task "${title}" has been created in project: ${project.customerName} by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          type: 'task_created_admin',
          taskId: task._id.toString(),
          projectId: projectId.toString(),
          triggeredBy: currentUserId,
          triggeredByModel: isCurrentUserAdmin ? 'User' : 'UserEmployee',
          data: {
            taskTitle: title,
            projectName: project.customerName || 'Unknown Project',
            createdBy: req.user ? req.user.name || req.user.email : 'Unknown',
            assignedTo: taskAssignees.join(', '),
            taskDetails: {
              title: title,
              comment: comment || '',
              status: status || 'new',
              startDate: startDate,
              endDate: endDate || null
            }
          },
        });
        console.log(`Admin notification sent to ${adminRecipients.length} admin users`);
      }
      
      } catch (notificationError) {
      console.error('Error sending task creation notifications:', notificationError);
        console.error('Notification error details:', {
          message: notificationError.message,
          stack: notificationError.stack,
          name: notificationError.name
        });
        // Don't fail the task creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Create task error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating task",
      error: error.message
    });
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    console.log('🔧 Updating task with body:', req.body);
    console.log('🔧 User info:', req.user);
    console.log('🔧 Task ID:', req.params.id);
    
    const { title, comment, startDate, endDate, status, assignedTo } = req.body;

    // Find task
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Update task data
    const taskData = {};

    if (title) taskData.title = title;
    if (comment !== undefined) taskData.comment = comment;
    if (startDate) taskData.startDate = new Date(startDate);
    if (endDate) taskData.endDate = new Date(endDate);
    if (status) taskData.status = status;

    // Handle assignedTo updates
    if (assignedTo) {
      const newAssignments = parseAssignedTo(assignedTo);
      taskData.assignedTo = newAssignments;
    }

    // Robustly parse assignedTo for all possible cases (array, stringified array, double-stringified array)
    if (assignedTo && assignedTo.length > 0) {
      let assignedArr = assignedTo;
      if (typeof assignedTo === "string") {
        try {
          assignedArr = JSON.parse(assignedTo);
        } catch {
          assignedArr = [assignedTo];
        }
      }
      // Handle double-stringified array (e.g., [ '["id1","id2"]' ])
      while (
        Array.isArray(assignedArr) &&
        assignedArr.length === 1 &&
        typeof assignedArr[0] === "string" &&
        assignedArr[0].startsWith("[")
      ) {
        try {
          assignedArr = JSON.parse(assignedArr[0]);
        } catch {
          break;
        }
      }
      // Ensure assignedArr is a flat array of strings
      if (Array.isArray(assignedArr)) {
        taskData.assignedTo = assignedArr.flat().filter(Boolean);
      } else {
        taskData.assignedTo = [assignedArr];
      }
    }

    // Add file attachments if provided (handled by middleware)
    if (req.beforeAttachments && req.beforeAttachments.length > 0) {
      taskData.beforeAttachments = [
        ...(task.beforeAttachments || []),
        ...req.beforeAttachments,
      ];
    }

    if (req.afterAttachments && req.afterAttachments.length > 0) {
      taskData.afterAttachments = [
        ...(task.afterAttachments || []),
        ...req.afterAttachments,
      ];
    }

    // Remove attachments if requested
    const parseRemoveList = (field) => {
      if (req.body[field]) {
        try {
          return JSON.parse(req.body[field]);
        } catch {
          return [];
        }
      }
      return [];
    };
    const removedBefore = parseRemoveList("removedBeforeAttachments");
    const removedAfter = parseRemoveList("removedAfterAttachments");
    const removedGeneral = parseRemoveList("removedGeneralAttachments");

    // Remove before attachments, then add new ones
    let filteredBefore = task.beforeAttachments || [];
    // Delete files for removed before attachments
    if (removedBefore.length > 0) {
      (task.beforeAttachments || []).forEach((att) => {
        if (removedBefore.includes(att.url) && att.filename) {
          const filePath = path.join(
            __dirname,
            "../../public/assets/images/tasks/before/",
            att.filename
          );
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
      filteredBefore = filteredBefore.filter(
        (att) => !removedBefore.includes(att.url)
      );
    }
    if (req.beforeAttachments && req.beforeAttachments.length > 0) {
      filteredBefore = [...filteredBefore, ...req.beforeAttachments];
    }
    taskData.beforeAttachments = filteredBefore;

    // Remove after attachments, then add new ones
    let filteredAfter = task.afterAttachments || [];
    // Delete files for removed after attachments
    if (removedAfter.length > 0) {
      (task.afterAttachments || []).forEach((att) => {
        if (removedAfter.includes(att.url) && att.filename) {
          const filePath = path.join(
            __dirname,
            "../../public/assets/images/tasks/after/",
            att.filename
          );
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
      filteredAfter = filteredAfter.filter(
        (att) => !removedAfter.includes(att.url)
      );
    }
    if (req.afterAttachments && req.afterAttachments.length > 0) {
      filteredAfter = [...filteredAfter, ...req.afterAttachments];
    }
    taskData.afterAttachments = filteredAfter;

    // Remove general attachments, then add new ones
    let filteredGeneral = task.attachements || [];
    // Delete files for removed general attachments
    if (removedGeneral.length > 0) {
      (task.attachements || []).forEach((att) => {
        if (removedGeneral.includes(att.url) && att.filename) {
          const filePath = path.join(
            __dirname,
            "../../public/assets/images/tasks/attachements/",
            att.filename
          );
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
      filteredGeneral = filteredGeneral.filter(
        (att) => !removedGeneral.includes(att.url)
      );
    }
    if (req.attachements && req.attachements.length > 0) {
      filteredGeneral = [...filteredGeneral, ...req.attachements];
    }
    taskData.attachements = filteredGeneral;

    // Get the original task to check status changes
    const originalTask = await Task.findById(req.params.id);
    const statusChanged = originalTask && originalTask.status !== status;
    const statusChangedToCompleted = statusChanged && status === 'completed';

    // Check if assignees changed
    const originalAssignees = originalTask ? (originalTask.assignedTo || []) : [];
    const newAssignees = taskData.assignedTo || [];
    const assigneesChanged = JSON.stringify(originalAssignees.sort()) !== JSON.stringify(newAssignees.sort());

    // Update the task
    task = await Task.findByIdAndUpdate(req.params.id, taskData, {
      new: true,
      runValidators: true,
    });

    // Get project information for notifications
    const project = await Project.findById(task.projectId);

    // Send comprehensive notifications based on what changed
    try {
      const currentUserId = req.user ? req.user.id || req.user._id : null;
      console.log('Current user ID:', currentUserId);
      console.log('Current user object:', req.user);
      
      // Get all notification recipients
      const taskAssignees = newAssignees || [];
      const projectAssignees = await getProjectAssignees(task.projectId);
      const adminUsers = await getAllAdminUsers();
      
      console.log('Task assignees:', taskAssignees);
      console.log('Project assignees:', projectAssignees);
      console.log('Admin users:', adminUsers);
      
      // Convert all IDs to strings for proper comparison
      const currentUserIdStr = currentUserId ? currentUserId.toString() : null;
      const taskAssigneesStr = taskAssignees.map(id => id.toString());
      const projectAssigneesStr = projectAssignees.map(id => id.toString());
      const adminUsersStr = adminUsers.map(id => id.toString());
      
        // Check if current user is admin (check both admin list and user role)
        const isCurrentUserAdmin = adminUsersStr.includes(currentUserIdStr) || 
          (req.user && (req.user.isAdmin || ['admin', 'hotel admin', 'super admin'].includes(req.user.role)));
      
      // Remove current user from all notification lists
      const taskAssigneeRecipients = taskAssigneesStr.filter(id => id !== currentUserIdStr);
      const projectRecipients = projectAssigneesStr.filter(id => 
        id !== currentUserIdStr && !taskAssigneesStr.includes(id)
      );
      
      // Admin recipients logic: 
      // - If current user is admin: exclude admin from notifications
      // - If current user is not admin: include admin in notifications
      const adminRecipients = isCurrentUserAdmin 
        ? [] // Admin won't get notifications when they create/update
        : adminUsersStr.filter(id => id !== currentUserIdStr); // Non-admin users will notify admins
      
      console.log('Task assignee recipients (excluding current user):', taskAssigneeRecipients);
      console.log('Project recipients (excluding current user):', projectRecipients);
      console.log('Admin recipients (excluding current user):', adminRecipients);
      console.log('Is current user admin?', isCurrentUserAdmin);
        
        // Set triggeredBy and triggeredByModel for creator tracking
        const triggeredBy = currentUserId;
        const triggeredByModel = isCurrentUserAdmin ? 'User' : 'UserEmployee';
      
      // 1. Task completion notification
      if (statusChangedToCompleted) {
        // Send to task assignees (excluding current user)
        if (taskAssigneeRecipients.length > 0) {
          await sendTaskNotification(taskAssigneeRecipients, {
          title: 'Task Completed',
            body: `Task "${task.title}" has been marked as completed by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          type: 'task_completed',
          taskId: task._id.toString(),
          projectId: task.projectId.toString(),
            triggeredBy: triggeredBy,
            triggeredByModel: triggeredByModel,
          data: {
            taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
            completedBy: req.user ? req.user.name || req.user.email : 'Unknown',
              changes: {
                status: 'completed',
                previousStatus: originalTask.status
              }
          },
        });
          console.log(`Task completion notification sent to ${taskAssigneeRecipients.length} task assignees`);
        }
        
        // Send to project assignees (excluding current user and task assignees)
        if (projectRecipients.length > 0) {
          await sendTaskNotification(projectRecipients, {
            title: 'Task Completed in Project',
            body: `Task "${task.title}" has been completed in project: ${project ? project.customerName : 'Unknown Project'}`,
            type: 'task_completed_project',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              completedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            },
          });
          console.log(`Task completion notification sent to ${projectRecipients.length} project assignees`);
        }
        
        // Send to admin users (excluding current user)
        if (adminRecipients.length > 0) {
          await sendAdminNotification(adminRecipients, {
            title: 'Task Completed',
            body: `Task "${task.title}" has been completed in project: ${project ? project.customerName : 'Unknown Project'}`,
            type: 'task_completed_admin',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              completedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            },
          });
          console.log(`Task completion notification sent to ${adminRecipients.length} admin users`);
        }
      }

      // 2. Task reassignment notification
      if (assigneesChanged && newAssignees.length > 0) {
        // Send to new task assignees (excluding current user)
        if (taskAssigneeRecipients.length > 0) {
          await sendTaskNotification(taskAssigneeRecipients, {
            title: 'Task Reassigned',
              body: `You have been assigned to task: "${task.title}" by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
            type: 'task_reassigned',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              assignedBy: req.user ? req.user.name || req.user.email : 'Unknown',
                changes: {
                  assignedTo: newAssignees,
                  previousAssignees: originalTask.assignedTo || []
                }
            },
          });
          console.log(`Task reassignment notification sent to ${taskAssigneeRecipients.length} task assignees`);
        }
        
        // Send to admin users (excluding current user)
        if (adminRecipients.length > 0) {
          await sendAdminNotification(adminRecipients, {
            title: 'Task Reassigned',
            body: `Task "${task.title}" has been reassigned in project: ${project ? project.customerName : 'Unknown Project'}`,
            type: 'task_reassigned_admin',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              assignedBy: req.user ? req.user.name || req.user.email : 'Unknown',
              assignedTo: taskAssignees.join(', '),
            },
          });
          console.log(`Task reassignment notification sent to ${adminRecipients.length} admin users`);
        }
      }

      // 3. General task update notification (for other significant changes)
      if (!statusChangedToCompleted && !assigneesChanged && (title || comment)) {
        // Send to task assignees (excluding current user)
        if (taskAssigneeRecipients.length > 0) {
            // Determine what was changed
            const changes = [];
            if (title && title !== originalTask.title) changes.push('title');
            if (comment !== undefined && comment !== originalTask.comment) changes.push('comment');
            if (status && status !== originalTask.status) changes.push('status');
            if (startDate && new Date(startDate).getTime() !== new Date(originalTask.startDate).getTime()) changes.push('start date');
            if (endDate !== undefined && endDate !== originalTask.endDate) changes.push('end date');
            
            const changesText = changes.length > 0 ? changes.join(', ') : 'details';
            
          await sendTaskNotification(taskAssigneeRecipients, {
            title: 'Task Updated',
              body: `Task "${task.title}" ${changesText} has been updated by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
            type: 'task_updated',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
                changes: {
                  fields: changes,
                  previousData: {
                    title: originalTask.title,
                    comment: originalTask.comment,
                    status: originalTask.status,
                    startDate: originalTask.startDate,
                    endDate: originalTask.endDate
                  },
                  newData: {
                    title: title || originalTask.title,
                    comment: comment !== undefined ? comment : originalTask.comment,
                    status: status || originalTask.status,
                    startDate: startDate || originalTask.startDate,
                    endDate: endDate !== undefined ? endDate : originalTask.endDate
                  }
                }
            },
          });
          console.log(`Task update notification sent to ${taskAssigneeRecipients.length} task assignees`);
        }
        
        // Send to project assignees (excluding current user and task assignees)
        if (projectRecipients.length > 0) {
          await sendTaskNotification(projectRecipients, {
            title: 'Task Updated in Project',
            body: `Task "${task.title}" has been updated in project: ${project ? project.customerName : 'Unknown Project'}`,
            type: 'task_updated_project',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            },
          });
          console.log(`Task update notification sent to ${projectRecipients.length} project assignees`);
        }
        
        // Send to admin users (excluding current user)
        if (adminRecipients.length > 0) {
          await sendAdminNotification(adminRecipients, {
            title: 'Task Updated',
            body: `Task "${task.title}" has been updated in project: ${project ? project.customerName : 'Unknown Project'}`,
            type: 'task_updated_admin',
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
              triggeredBy: triggeredBy,
              triggeredByModel: triggeredByModel,
            data: {
              taskTitle: task.title,
              projectName: project ? project.customerName : 'Unknown Project',
              updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            },
          });
          console.log(`Task update notification sent to ${adminRecipients.length} admin users`);
        }
        }
      } catch (notificationError) {
      console.error('Error sending task update notifications:', notificationError);
        console.error('Notification error details:', {
          message: notificationError.message,
          stack: notificationError.stack,
          name: notificationError.name
        });
        // Don't fail the task update if notification fails
      }

    // If status changed, update project task counts
    if (status) {
      await updateProjectTaskCounts(task.projectId);
    }

    res.status(200).json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Update task error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating task",
      error: error.message
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Store project ID before deleting task
    const projectId = task.projectId;

    // Delete associated files
    const deleteFiles = (attachments, folder) => {
      if (!attachments) return;
      attachments.forEach((file) => {
        if (file && file.filename) {
          const filePath = path.join(
            __dirname,
            `../../public/assets/images/tasks/${folder}/`,
            file.filename
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    };
    deleteFiles(task.beforeAttachments, "before");
    deleteFiles(task.afterAttachments, "after");
    deleteFiles(task.attachements, "attachements");

    // Delete the task
    await task.deleteOne();

    // Update project task counts
    await updateProjectTaskCounts(projectId);

    res.status(200).json({
      success: true,
      data: {},
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
};

/**
 * Helper function to update project task counts, progress, and assigned employees
 */
const updateProjectTaskCounts = async (projectId) => {
  try {
    // Get all tasks for the project with populated assignedTo field
    const tasks = await Task.find({ projectId }).populate("assignedTo");

    // Count total tasks
    const totalTasks = tasks.length;

    // Count completed tasks
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    // Calculate progress percentage
    let progressPercentage = 0;
    if (totalTasks > 0) {
      progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    }

    // Get unique assigned employees from all tasks
    const assignedEmployeeIds = new Set();
    tasks.forEach((task) => {
      if (Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach((emp) => {
          if (emp && emp._id) assignedEmployeeIds.add(emp._id.toString());
        });
      }
    });

    // Convert Set to Array for MongoDB
    const uniqueAssignedEmployees = Array.from(assignedEmployeeIds);

    // Get project details for notifications
    const project = await Project.findById(projectId);
    
    // Update project with task counts, progress percentage, and assigned employees
    await Project.findByIdAndUpdate(projectId, {
      totalTasks,
      completedTasks,
      progress: `${progressPercentage}%`,
      assignedEmployees: uniqueAssignedEmployees,
    });

    console.log(
      `Project ${projectId} updated: ${completedTasks}/${totalTasks} tasks completed (${progressPercentage}%), ${uniqueAssignedEmployees.length} unique employees assigned`
    );

    // Send project completion notification if all tasks are completed
    if (totalTasks > 0 && completedTasks === totalTasks && project) {
      try {
        // Get all employees assigned to this project
        const projectEmployees = uniqueAssignedEmployees;
        
        if (projectEmployees.length > 0) {
          await sendTaskNotification(projectEmployees, {
            title: 'Project Completed!',
            body: `Project "${project.customerName}" has been completed successfully!`,
            type: 'project_completed',
            projectId: projectId.toString(),
            data: {
              projectName: project.customerName,
              totalTasks: totalTasks.toString(),
              completedTasks: completedTasks.toString(),
              progress: `${progressPercentage}%`,
            },
          });
          console.log(`Project completion notification sent to ${projectEmployees.length} employees`);
        }
      } catch (notificationError) {
        console.error('Error sending project completion notification:', notificationError);
      }
    }

    return true;
  } catch (error) {
    console.error("Update project task counts error:", error);
    return false;
  }
};

module.exports = {
  getTasksByProject,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
