const Notification = require('../models/notification/Notification');
const UserEmployee = require('../models/employeeManagement/UserEmployeeSchema');
const User = require('../models/user');

/**
 * Create a single notification
 */
const createNotification = async ({
      userId,
      type,
      title,
      body,
      data = {},
      priority = 'medium',
  taskId = null,
  projectId = null,
  proposalId = null,
  triggeredBy = null,
  triggeredByModel = 'UserEmployee'
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
      priority,
      taskId,
      projectId,
      proposalId,
      triggeredBy,
      triggeredByModel
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create bulk notifications for multiple users
 */
const createBulkNotifications = async ({
  userIds,
        type,
        title,
        body,
        data = {},
        priority = 'medium',
  taskId = null,
  projectId = null,
  proposalId = null,
  triggeredBy = null,
  triggeredByModel = 'UserEmployee'
}) => {
  try {
    const notifications = userIds.map(userId => ({
        userId,
        type,
        title,
        body,
        data,
        priority,
        taskId,
        projectId,
      proposalId,
      triggeredBy,
      triggeredByModel
    }));

    const savedNotifications = await Notification.insertMany(notifications);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Create task-related notifications
 */
const createTaskNotification = async ({
      userIds,
      type,
      title,
      body,
      data = {},
      priority = 'medium',
      taskId,
      projectId,
  triggeredBy,
  triggeredByModel = 'UserEmployee'
}) => {
  return createBulkNotifications({
    userIds,
    type,
    title,
    body,
    data,
    priority,
    taskId,
    projectId,
    triggeredBy,
    triggeredByModel
  });
};

/**
 * Get users with specific permissions for a module
 */
const getUsersWithPermission = async (module, action = 'view') => {
  try {
    // Get all admin users (they have all permissions)
    const adminUsers = await User.find({
      $or: [
        { isAdmin: true },
        { role: { $in: ['admin', 'hotel admin', 'super admin'] } }
      ]
    });

    // Get employees with specific permissions
    const employeesWithPermission = await UserEmployee.find({
      'permissions': {
        $elemMatch: {
          'page': { $regex: new RegExp(module, 'i') },
          [`actions.${action}`]: true
        }
      }
    }).populate('role');

    // Combine admin users and employees with permissions
    const allUsers = [
      ...adminUsers.map(user => ({
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: true,
        type: 'admin'
      })),
      ...employeesWithPermission.map(emp => ({
        _id: emp._id,
        email: emp.email,
        name: emp.email, // Use email as name for employees
        isAdmin: false,
        type: 'employee'
      }))
    ];

    return allUsers;
  } catch (error) {
    console.error('Error getting users with permission:', error);
    return [];
  }
};

/**
 * Create proposal notifications based on roles and permissions
 */
const createProposalNotification = async ({
  type,
  title,
  body,
  data = {},
  priority = 'medium',
  proposalId,
  triggeredBy,
  triggeredByModel = 'UserEmployee'
}) => {
  try {
    // Get users with proposal permissions
    const usersWithPermission = await getUsersWithPermission('proposals', 'view');
    
    if (usersWithPermission.length === 0) {
      console.log('No users found with proposal permissions');
      return [];
    }

    // Filter out the user who triggered the action
    const recipientUsers = usersWithPermission.filter(user => 
      user._id.toString() !== triggeredBy?.toString()
    );

    if (recipientUsers.length === 0) {
      console.log('No recipients found for proposal notification');
      return [];
    }

    const userIds = recipientUsers.map(user => user._id);

    return createBulkNotifications({
      userIds,
      type,
      title,
      body,
      data,
      priority,
      proposalId,
      triggeredBy,
      triggeredByModel
    });
  } catch (error) {
    console.error('Error creating proposal notification:', error);
    throw error;
  }
};

/**
 * Create project notifications based on roles and permissions
 */
const createProjectNotification = async ({
  type,
  title,
  body,
  data = {},
  priority = 'medium',
  projectId,
  triggeredBy,
  triggeredByModel = 'UserEmployee'
}) => {
  try {
    // Get users with project permissions
    const usersWithPermission = await getUsersWithPermission('projects', 'view');
    
    if (usersWithPermission.length === 0) {
      console.log('No users found with project permissions');
      return [];
    }

    // Filter out the user who triggered the action
    const recipientUsers = usersWithPermission.filter(user => 
      user._id.toString() !== triggeredBy?.toString()
    );

    if (recipientUsers.length === 0) {
      console.log('No recipients found for project notification');
      return [];
    }

    const userIds = recipientUsers.map(user => user._id);

    return createBulkNotifications({
      userIds,
      type,
      title,
      body,
      data,
      priority,
      projectId,
      triggeredBy,
      triggeredByModel
    });
  } catch (error) {
    console.error('Error creating project notification:', error);
    throw error;
  }
};

/**
 * Create employee notifications based on roles and permissions
 */
const createEmployeeNotification = async ({
  type,
  title,
  body,
  data = {},
  priority = 'medium',
  employeeId,
  triggeredBy,
  triggeredByModel = 'UserEmployee'
}) => {
  try {
    // Get users with employee management permissions
    const usersWithPermission = await getUsersWithPermission('employees', 'view');
    
    if (usersWithPermission.length === 0) {
      console.log('No users found with employee permissions');
      return [];
    }

    // Filter out the user who triggered the action
    const recipientUsers = usersWithPermission.filter(user => 
      user._id.toString() !== triggeredBy?.toString()
    );

    if (recipientUsers.length === 0) {
      console.log('No recipients found for employee notification');
      return [];
    }

    const userIds = recipientUsers.map(user => user._id);

    return createBulkNotifications({
      userIds,
      type,
      title,
      body,
      data,
      priority,
      employeeId,
      triggeredBy,
      triggeredByModel
    });
  } catch (error) {
    console.error('Error creating employee notification:', error);
    throw error;
  }
};

/**
 * Mark notification as sent (for FCM tracking)
 */
const markNotificationAsSent = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, {
      fcmSent: true,
      fcmSentAt: new Date()
    });
  } catch (error) {
    console.error('Error marking notification as sent:', error);
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({
      userId,
      isRead: false
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.modifiedCount;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete old notifications (cleanup utility)
 */
const deleteOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });

    console.log(`Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  createTaskNotification,
  createProposalNotification,
  createProjectNotification,
  createEmployeeNotification,
  getUsersWithPermission,
  markNotificationAsSent,
  getUnreadCount,
  markAllAsRead,
  deleteOldNotifications
}; 