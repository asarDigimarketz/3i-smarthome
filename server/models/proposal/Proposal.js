const mongoose = require("mongoose");

/**
 * Proposal Schema
 * Defines the structure for proposal documents in MongoDB
 * Based on the client component requirements
 */
const proposalSchema = new mongoose.Schema(
  {
    // Customer Information
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
      match: [/^[\+]?[0-9\s\-\(\)]+$/, "Please enter a valid contact number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    // Address Information
    address: {
      addressLine: {
        type: String,
        required: [true, "Address line is required"],
        trim: true,
        maxlength: [200, "Address line cannot exceed 200 characters"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [50, "City cannot exceed 50 characters"],
      },
      district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
        maxlength: [50, "District cannot exceed 50 characters"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxlength: [50, "State cannot exceed 50 characters"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        maxlength: [50, "Country cannot exceed 50 characters"],
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
      },
    },

    // Project Information
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
      maxlength: [1000, "Project description cannot exceed 1000 characters"],
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
      maxlength: [50, "Size cannot exceed 50 characters"],
    },

    // Status and Comments
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Hot", "Cold", "Warm", "Scrap", "Confirmed"],
        message: "Invalid status",
      },
      default: "Warm",
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // Amount Options for dropdown
    amountOptions: {
      type: [String],
    },

    // File Attachment
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
      path: {
        type: String,
        trim: true,
      },
    },

    // Proposal Date
    date: {
      type: Date,
      required: [true, "Proposal date is required"],
      default: Date.now,
    },
  },
  {
    // Schema options
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field to format the full address
 */
proposalSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.addressLine}, ${addr.city}, ${addr.district}, ${addr.state}, ${addr.country} - ${addr.pincode}`;
});

/**
 * Virtual field to format the project amount with currency
 */
proposalSchema.virtual("formattedAmount").get(function () {
  return `₹${this.projectAmount.toLocaleString("en-IN")}`;
});

/**
 * Index for better query performance
 */
proposalSchema.index({ customerName: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ date: -1 });
proposalSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware to clean up data
 */
proposalSchema.pre("save", function (next) {
  // Remove empty attachment object if no file uploaded
  if (this.attachment && !this.attachment.filename) {
    this.attachment = undefined;
  }
  next();
});

/**
 * Static method to get proposals with pagination and filtering
 */
proposalSchema.statics.getProposalsWithFilters = function (
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
    dateFrom = "",
    dateTo = "",
  } = options;

  const query = {};

  // Add additional filters (like service filter)
  Object.assign(query, filters);

  // Add search filter
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Add status filter
  if (status) {
    query.status = status;
  }

  // Add date range filter
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  return this.find(query).sort(sort).skip(skip).limit(limit).lean();
};

/**
 * Static method to get total count for pagination
 */
proposalSchema.statics.getProposalsCount = function (filters = {}) {
  const {
    search = "",
    status = "",
    dateFrom = "",
    dateTo = "",
    ...additionalFilters
  } = filters;

  const query = {};

  // Add additional filters (like service filter)
  Object.assign(query, additionalFilters);

  // Add search filter
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Add status filter
  if (status) {
    query.status = status;
  }

  // Add date range filter
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  return this.countDocuments(query);
};

/**
 * Create and export the Proposal model
 */
const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
