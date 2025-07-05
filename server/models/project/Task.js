const mongoose = require("mongoose");

/**
 * Task Schema
 * Defines the structure for task documents in MongoDB
 * Tasks are associated with projects
 */
const taskSchema = new mongoose.Schema(
  {
    // Reference to parent project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },

    // Task Information
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Task title cannot exceed 100 characters"],
    },

    // Comment/Description
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // Task dates
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
    },

    // Task Status
    status: {
      type: String,
      required: [true, "Task status is required"],
      enum: {
        values: ["new", "inprogress", "completed"],
        message: "Invalid task status",
      },
      default: "new",
    },

    // Assigned Employee
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // Attachments - Before images/files
    beforeAttachments: [
      {
        filename: {
          type: String,
          trim: true,
        },
        originalName: {
          type: String,
          trim: true,
        },
        mimetype: {
          type: String,
          trim: true,
        },
        size: {
          type: Number,
          min: [0, "File size cannot be negative"],
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],

    // Attachments - After images/files
    afterAttachments: [
      {
        filename: {
          type: String,
          trim: true,
        },
        originalName: {
          type: String,
          trim: true,
        },
        mimetype: {
          type: String,
          trim: true,
        },
        size: {
          type: Number,
          min: [0, "File size cannot be negative"],
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],
    attachements: [
      {
        filename: {
          type: String,
          trim: true,
        },
        originalName: {
          type: String,
          trim: true,
        },
        mimetype: {
          type: String,
          trim: true,
        },
        size: {
          type: Number,
          min: [0, "File size cannot be negative"],
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create index for faster querying
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Task", taskSchema);
