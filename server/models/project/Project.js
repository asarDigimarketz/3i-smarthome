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

    // Task list for detailed tracking
    tasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedDate: {
          type: Date,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
      },
    ],
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

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate skip
  const skip = (page - 1) * limit;

  return (
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      // .populate("assignedEmployees", "name email")
      .lean()
  );
};

/**
 * Static method to get projects count
 */
projectSchema.statics.getProjectsCount = function (filters = {}) {
  const { search = "", status = "", service = "" } = filters;

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

  return this.countDocuments(query);
};

module.exports = mongoose.model("Project", projectSchema);
