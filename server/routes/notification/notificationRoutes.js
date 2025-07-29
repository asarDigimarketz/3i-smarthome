const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} = require('../../controllers/notification/notificationController');
const authenticateToken = require('../../middleware/authMiddleware');

// All routes are protected with JWT authentication
router.use(authenticateToken);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', getNotificationStats);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

// DELETE /api/notifications/delete-all - Delete all notifications
router.delete('/delete-all', deleteAllNotifications);

// POST /api/notifications - Create notification (for internal use)
router.post('/', createNotification);

module.exports = router; 