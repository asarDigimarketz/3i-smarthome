const mongoose = require("mongoose");

/**
 * Project Schema
 * Defines the structure for project documents in MongoDB
 * Created from confirmed proposals
 */
const projectSchema = new mongoose.Schema(
  {
    // Reference to original proposal (when created from proposal)
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: false, // Not required for manually created projects
    },

    // Reference to customer (when customer is created)
    customerId: {
      type: String,
      sparse: true, // Allows null/undefined while maintaining uniqueness
    },

    // Customer Information (from AddProject form)
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    // Address Information (from AddProject form)
    address: {
      addressLine: {
        type: String,
        required: [true, "Address line is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
    },

    // Project Information (from AddProject form)
    services: {
      type: String,
      required: [true, "Service is required"],
      enum: {
        values: [
          "Home Cinema",
          "Home Automation",
          "Security System",
          "Outdoor Audio Solution",
        ],
        message: "Invalid service type",
      },
    },

    projectDescription: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },

    projectAmount: {
      type: Number,
      required: [true, "Project amount is required"],
      min: [0, "Project amount cannot be negative"],
    },

    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
    },

    comment: {
      type: String,
      trim: true,
    },

    // Project Status
    projectStatus: {
      type: String,
      required: [true, "Project status is required"],
      enum: {
        values: ["new", "in-progress", "completed", "done", "cancelled"],
        message: "Invalid project status",
      },
      default: "new",
    },

    // Project Dates
    projectDate: {
      type: Date,
      required: [true, "Project date is required"],
      default: Date.now,
    },

    startDate: {
      type: Date,
    },

    completionDate: {
      type: Date,
    },

    // Project Team
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    // Project Notes
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    progress: {
      type: String,
      trim: true,
    },

    // Original proposal date (when created from proposal)
    proposalDate: {
      type: Date,
      required: false,
    },

    // Project Attachment
    attachment: {
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

    // Task and Progress Management
    totalTasks: {
      type: Number,
      default: 0,
      min: [0, "Total tasks cannot be negative"],
    },

    completedTasks: {
      type: Number,
      default: 0,
      min: [0, "Completed tasks cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field to format the full address
 */
projectSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.addressLine}, ${addr.city}, ${addr.district}, ${addr.state}, ${addr.country} - ${addr.pincode}`;
});

/**
 * Virtual field to format the project amount
 */
projectSchema.virtual("formattedAmount").get(function () {
  return `₹${this.projectAmount.toLocaleString("en-IN")}`;
});

/**
 * Virtual field to get progress as a percentage number
 */
projectSchema.virtual("progressPercentage").get(function () {
  if (this.totalTasks === 0) return 0;
  return Math.round((this.completedTasks / this.totalTasks) * 100);
});

/**
 * Virtual field to get progress status text
 */
projectSchema.virtual("progressStatus").get(function () {
  const percentage = this.progressPercentage;
  if (percentage === 0) return "Not Started";
  if (percentage === 100) return "Completed";
  if (percentage >= 75) return "Near Completion";
  if (percentage >= 50) return "In Progress";
  if (percentage >= 25) return "Started";
  return "Just Started";
});

/**
 * Pre-save middleware to update progress based on tasks
 */
projectSchema.pre("save", function (next) {
  // Update task counts and progress based on tasks array
  if (this.tasks && this.tasks.length > 0) {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter((task) => task.isCompleted).length;
    this.progress = `${this.completedTasks}/${this.totalTasks}`;
  } else if (this.totalTasks > 0) {
    // If no tasks array but totalTasks is set, use existing counts
    this.progress = `${this.completedTasks || 0}/${this.totalTasks}`;
  } else {
    // Default progress
    this.progress = "0/0";
  }

  next();
});

/**
 * Index for better query performance
 */
projectSchema.index({ customerName: 1 });
projectSchema.index({ projectStatus: 1 });
projectSchema.index({ proposalId: 1 });
projectSchema.index({ createdAt: -1 });

/**
 * Static method to get projects with filters
 */
projectSchema.statics.getProjectsWithFilters = function (
  filters = {},
  options = {}
) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search = "",
    status = "",
    service = "",
    startDate = "",
    endDate = "",
  } = options;

  // Build query
  let query = { ...filters };

  // Add search functionality
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contactNumber: { $regex: search, $options: "i" } },
    ];
  }

  // Add status filter
  if (status) {
    query.projectStatus = status;
  }

  // Add service filter
  if (service) {
    query.services = service;
  }

  // Add date range filter
  if (startDate || endDate) {
    query.projectDate = {};
    if (startDate) {
      query.projectDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.projectDate.$lte = new Date(endDate);
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate skip
  const skip = (page - 1) * limit;

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("assignedEmployees", "firstName lastName email avatar")
    .lean();
};

/**
 * Static method to get projects count
 */
projectSchema.statics.getProjectsCount = function (filters = {}) {
  const {
    search = "",
    status = "",
    service = "",
    startDate = "",
    endDate = "",
  } = filters;

  let query = { ...filters };

  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contactNumber: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.projectStatus = status;
  }

  if (service) {
    query.services = service;
  }

  // Add date range filter
  if (startDate || endDate) {
    query.projectDate = {};
    if (startDate) {
      query.projectDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.projectDate.$lte = new Date(endDate);
    }
  }

  return this.countDocuments(query);
};

/**
 * Static method to sync project with its tasks
 * Useful for manual synchronization or data migration
 */
projectSchema.statics.syncProjectWithTasks = async function (projectId) {
  const Task = require("./Task");

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
      if (task.assignedTo && task.assignedTo._id) {
        assignedEmployeeIds.add(task.assignedTo._id.toString());
      }
    });

    // Convert Set to Array for MongoDB
    const uniqueAssignedEmployees = Array.from(assignedEmployeeIds);

    // Update project with task counts, progress percentage, and assigned employees
    const updatedProject = await this.findByIdAndUpdate(
      projectId,
      {
        totalTasks,
        completedTasks,
        progress: `${progressPercentage}%`,
        assignedEmployees: uniqueAssignedEmployees,
      },
      { new: true }
    );

    return {
      success: true,
      project: updatedProject,
      stats: {
        totalTasks,
        completedTasks,
        progressPercentage,
        assignedEmployeesCount: uniqueAssignedEmployees.length,
      },
    };
  } catch (error) {
    console.error("Error syncing project with tasks:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = mongoose.model("Project", projectSchema);
