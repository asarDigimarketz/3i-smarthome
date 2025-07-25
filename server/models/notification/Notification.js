const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserEmployee',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'task_assigned',
      'task_completed', 
      'task_updated',
      'task_reassigned',
      'task_created',
      'task_created_admin',
      'task_completed_project',
      'task_completed_admin',
      'task_updated_project',
      'task_updated_admin',
      'task_reassigned_admin',
      'project_completed',
      'project_created',
      'project_updated',
      'project_deleted',
      'project_field_updated',
      'employee_added',
      'employee_updated',
      'employee_created',
      'employee_deleted',
      'customer_added',
      'customer_updated',
      'proposal_created',
      'proposal_updated',
      'proposal_deleted',
      'proposal_field_updated'
    ]
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    index: true
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'triggeredByModel'
  },
  triggeredByModel: {
    type: String,
    enum: ['UserEmployee', 'User'],
    default: 'UserEmployee'
  },
  fcmSent: {
    type: Boolean,
    default: false
  },
  fcmSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
});

// Virtual for creator information
notificationSchema.virtual('creatorInfo').get(function() {
  if (this.populated('triggeredBy')) {
    const creator = this.triggeredBy;
    if (creator) {
      return {
        id: creator._id,
        name: creator.name || creator.email || 'Unknown User',
        email: creator.email,
        isAdmin: creator.isAdmin || false
      };
    }
  }
  return null;
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema); 