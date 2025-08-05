const FCMToken = require('../models/fcmToken');
const { getAdmin } = require('../config/firebase');

// Register FCM token
const registerToken = async (req, res) => {
  try {
    const { token, userId, deviceType, platform } = req.body;



    if (!token || !deviceType || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token, deviceType, and platform are required',
      });
    }

    // Check if token already exists
    let existingToken = await FCMToken.findOne({ token });

    if (existingToken) {
      // Update existing token
      existingToken.userId = userId;
      existingToken.deviceType = deviceType;
      existingToken.platform = platform;
      existingToken.isActive = true;
      existingToken.lastUsed = Date.now();
      await existingToken.save();


      return res.status(200).json({
        success: true,
        message: 'FCM token updated successfully',
        data: existingToken,
      });
    }

    // Create new token
    const newToken = new FCMToken({
      token,
      userId,
      deviceType,
      platform,
    });

    await newToken.save();


    res.status(201).json({
      success: true,
      message: 'FCM token registered successfully',
      data: newToken,
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



// Send notification to specific user
// Helper function to convert all values to strings for FCM
const convertToFCMData = (data) => {
  const converted = {};
  for (const [key, value] of Object.entries(data || {})) {
    converted[key] = String(value);
  }
  return converted;
};

const sendNotificationToUser = async (userId, notification) => {
  try {
    const admin = getAdmin();
    const tokens = await FCMToken.find({
      userId,
      isActive: true,
    });

    if (tokens.length === 0) {
      return { success: false, message: 'No active tokens found' };
    }

    const tokenList = tokens.map(t => t.token);
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually if sendMulticast is not available
    for (const token of tokenList) {
      try {
        // Convert all data values to strings for FCM compatibility
        const fcmData = convertToFCMData(notification.data);

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

    return {
      success: true,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to all users
const sendNotificationToAll = async (notification) => {
  try {
    const admin = getAdmin();
    const tokens = await FCMToken.find({ isActive: true });

    if (tokens.length === 0) {
      return { success: false, message: 'No active tokens found' };
    }

    const tokenList = tokens.map(t => t.token);
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually if sendMulticast is not available
    for (const token of tokenList) {
      try {
        // Convert all data values to strings for FCM compatibility
        const fcmData = convertToFCMData(notification.data);

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

    return {
      success: true,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('Error sending notification to all:', error);
    return { success: false, error: error.message };
  }
};






// Test notification endpoint
const testNotification = async (req, res) => {
  try {
    const { userId, type = 'test' } = req.body;

    // First, test Firebase initialization
    const admin = getAdmin();

    const messaging = admin.messaging();

    // Check if send method is available (fallback for sendMulticast)
    if (typeof messaging.send !== 'function') {
      console.error('❌ send method is not available');
      return res.status(500).json({
        success: false,
        message: 'Firebase messaging not properly initialized',
        availableMethods: Object.getOwnPropertyNames(messaging),
      });
    }

    let notification;
    switch (type) {
      case 'task_assigned':
        notification = {
          title: 'New Task Assigned',
          body: 'You have been assigned a new task: Install Smart Home System',
          type: 'task_assigned',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            assignedBy: 'Test User',
          },
        };
        break;

      case 'task_reassigned':
        notification = {
          title: 'Task Reassigned',
          body: 'You have been assigned to task: Install Smart Home System',
          type: 'task_reassigned',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            assignedBy: 'Test User',
          },
        };
        break;

      case 'task_updated':
        notification = {
          title: 'Task Updated',
          body: 'Task "Install Smart Home System" has been updated',
          type: 'task_updated',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            updatedBy: 'Test User',
          },
        };
        break;

      case 'task_created':
        notification = {
          title: 'New Task Created in Project',
          body: 'A new task "Install Smart Home System" has been created in project: Test Project',
          type: 'task_created',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            createdBy: 'Test User',
          },
        };
        break;

      case 'task_created_admin':
        notification = {
          title: 'New Task Created',
          body: 'A new task "Install Smart Home System" has been created in project: Test Project',
          type: 'task_created_admin',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            createdBy: 'Test User',
            assignedTo: 'Test Employee',
          },
        };
        break;

      case 'task_completed':
        notification = {
          title: 'Task Completed',
          body: 'Task "Install Smart Home System" has been marked as completed',
          type: 'task_completed',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            completedBy: 'Test User',
          },
        };
        break;

      case 'task_completed_project':
        notification = {
          title: 'Task Completed in Project',
          body: 'Task "Install Smart Home System" has been completed in project: Test Project',
          type: 'task_completed_project',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            completedBy: 'Test User',
          },
        };
        break;

      case 'task_completed_admin':
        notification = {
          title: 'Task Completed',
          body: 'Task "Install Smart Home System" has been completed in project: Test Project',
          type: 'task_completed_admin',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            completedBy: 'Test User',
          },
        };
        break;

      case 'task_updated_project':
        notification = {
          title: 'Task Updated in Project',
          body: 'Task "Install Smart Home System" has been updated in project: Test Project',
          type: 'task_updated_project',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            updatedBy: 'Test User',
          },
        };
        break;

      case 'task_updated_admin':
        notification = {
          title: 'Task Updated',
          body: 'Task "Install Smart Home System" has been updated in project: Test Project',
          type: 'task_updated_admin',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            updatedBy: 'Test User',
          },
        };
        break;

      case 'task_reassigned_admin':
        notification = {
          title: 'Task Reassigned',
          body: 'Task "Install Smart Home System" has been reassigned in project: Test Project',
          type: 'task_reassigned_admin',
          taskId: 'test-task-id',
          projectId: 'test-project-id',
          data: {
            taskTitle: 'Install Smart Home System',
            projectName: 'Test Project',
            assignedBy: 'Test User',
            assignedTo: 'Test Employee',
          },
        };
        break;

      case 'project_completed':
        notification = {
          title: 'Project Completed!',
          body: 'Project "Test Project" has been completed successfully!',
          type: 'project_completed',
          projectId: 'test-project-id',
          data: {
            projectName: 'Test Project',
            totalTasks: '5',
            completedTasks: '5',
            progress: '100%',
          },
        };
        break;

      default:
        notification = {
          title: 'Dk Test Notification',
          body: 'Oru Ponu vennum gokul Annanuku',
          type: 'test',
          data: {
            timestamp: new Date().toISOString(),
          },
        };
    }

    if (userId) {
      // Send to specific user
      const result = await sendNotificationToUser(userId, notification);
      res.status(200).json({
        success: true,
        message: 'Test notification sent to user',
        result,
      });
    } else {
      // Send to all users
      const result = await sendNotificationToAll(notification);
      res.status(200).json({
        success: true,
        message: 'Test notification sent to all users',
        result,
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  registerToken,
  sendNotificationToUser,
  sendNotificationToAll,

  testNotification,
}; 