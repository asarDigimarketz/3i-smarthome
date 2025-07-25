const Notification = require('../../models/notification/Notification');
const UserEmployee = require('../../models/employeeManagement/UserEmployeeSchema');
const User = require('../../models/user');

/**
 * @desc    Create a new notification
 * @route   POST /api/notifications
 * @access  Private
 */
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      body,
      data = {},
      priority = 'medium',
      taskId,
      projectId,
      triggeredBy
    } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, type, title, and body'
      });
    }

    // Check if user exists (try both UserEmployee and User models)
    let user = await UserEmployee.findById(userId);
    let userType = 'employee';
    
    if (!user) {
      // Try User model (admin users)
      user = await User.findById(userId);
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
      priority,
      taskId,
      projectId,
      triggeredBy
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating notification'
    });
  }
};

/**
 * @desc    Get notifications for a user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user exists (try both UserEmployee and User models)
    let user = await UserEmployee.findById(userId);
    let userType = 'employee';
    
    if (!user) {
      // Try User model (admin users)
      user = await User.findById(userId);
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      priority,
      taskId,
      projectId
    } = req.query;

    // Build filter object
    const filter = { userId };
    
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (priority) filter.priority = priority;
    if (taskId) filter.taskId = taskId;
    if (projectId) filter.projectId = projectId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get notifications with pagination
    let notifications;
    try {
      notifications = await Notification.find(filter)
        .populate('taskId', 'title status')
        .populate('projectId', 'customerName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(); // Use lean() to avoid virtual field issues
      
      // Manually populate triggeredBy for each notification
      for (let notification of notifications) {
        if (notification.triggeredBy) {
          try {
            if (notification.triggeredByModel === 'User') {
              const User = require('../../models/user');
              const user = await User.findById(notification.triggeredBy).select('name email isAdmin').lean();
              notification.triggeredBy = user;
            } else {
              const UserEmployee = require('../../models/employeeManagement/UserEmployeeSchema');
              const user = await UserEmployee.findById(notification.triggeredBy).select('name email isAdmin').lean();
              notification.triggeredBy = user;
            }
          } catch (populateError) {
            console.error('Error populating triggeredBy:', populateError);
            notification.triggeredBy = null;
          }
        }
      }
    } catch (populateError) {
      console.error('Error populating notification data:', populateError);
      // Fallback to basic notification data without population
      notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
    }

    // Get total count for pagination
    const total = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        unreadCount
      },
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving notifications'
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
};

/**
 * @desc    Mark all notifications as read for a user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: {
        updatedCount: result.modifiedCount
      },
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notifications as read'
    });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

/**
 * @desc    Get notification statistics for a user
 * @route   GET /api/notifications/stats
 * @access  Private
 */
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const [total, unread, today] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
      Notification.countDocuments({
        userId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        today
      },
      message: 'Notification statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving notification statistics'
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats
}; 