const mongoose = require("mongoose");
const generateCustomerId = require("../../utils/helpers/customerIdGenerator");

/**
 * Customer Schema
 * Defines the structure for customer documents in MongoDB
 * Created automatically when projects are created
 */
const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
    },

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

    // Customer Statistics
    totalProjects: {
      type: Number,
      default: 0,
      min: [0, "Total projects cannot be negative"],
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: [0, "Total spent cannot be negative"],
    },

    // Services used by customer
    services: [
      {
        type: String,
        enum: [
          "Home Cinema",
          "Home Automation",
          "Security System",
          "Outdoor Audio Solution",
        ],
      },
    ],

    // Customer status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Projects associated with this customer
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    // Notes about the customer
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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
customerSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.addressLine}, ${addr.city}, ${addr.district}, ${addr.state}, ${addr.country} - ${addr.pincode}`;
});

/**
 * Virtual field to format the total spent amount
 */
customerSchema.virtual("formattedTotalSpent").get(function () {
  return `₹${this.totalSpent.toLocaleString("en-IN")}`;
});

/**
 * Index for better query performance
 */
customerSchema.index({ customerName: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ contactNumber: 1 });
customerSchema.index({ createdAt: -1 });

/**
 * Static method to get customers with filters
 */
customerSchema.statics.getCustomersWithFilters = function (
  filters = {},
  options = {}
) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search = "",
    service = "",
    status = "",
  } = options;

  // Build query
  let query = { ...filters };

  // Add search functionality
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contactNumber: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
    ];
  }

  // Add service filter
  if (service && service !== "all") {
    query.services = { $in: [service] };
  }

  // Add status filter
  if (status) {
    query.status = status;
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
    .populate("projects", "projectStatus services projectAmount")
    .lean();
};

/**
 * Static method to get customers count
 */
customerSchema.statics.getCustomersCount = function (filters = {}) {
  const { search = "", service = "", status = "" } = filters;

  let query = { ...filters };

  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contactNumber: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
    ];
  }

  if (service && service !== "all") {
    query.services = { $in: [service] };
  }

  if (status) {
    query.status = status;
  }

  return this.countDocuments(query);
};

/**
 * Static method to find or create customer
 */
customerSchema.statics.findOrCreateCustomer = async function (customerData) {
  try {
    // Try to find existing customer by email or contact number
    let customer = await this.findOne({
      $or: [
        { email: customerData.email },
        { contactNumber: customerData.contactNumber },
      ],
    });

    if (customer) {
      // Update existing customer if needed
      let updated = false;

      // Update contact number if different
      if (customer.contactNumber !== customerData.contactNumber) {
        customer.contactNumber = customerData.contactNumber;
        updated = true;
      }

      // Update customer name if different
      if (customer.customerName !== customerData.customerName) {
        customer.customerName = customerData.customerName;
        updated = true;
      }

      // Update address if different
      const addressChanged =
        JSON.stringify(customer.address) !==
        JSON.stringify(customerData.address);
      if (addressChanged) {
        customer.address = customerData.address;
        updated = true;
      }

      if (updated) {
        await customer.save();
      }

      return customer;
    } else {
      // Generate customerId for new customer
      const customerId = await generateCustomerId({
        email: customerData.email,
        mobileNo: customerData.contactNumber,
        updateProjects: false,
      });

      // Create new customer with generated customerId
      const newCustomerData = {
        ...customerData,
        customerId,
        status: customerData.status || "Active",
      };

      try {
        customer = await this.create(newCustomerData);
        return customer;
      } catch (error) {
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
          // Try to find the customer that was just created by another process
          const existingCustomer = await this.findOne({
            $or: [
              { email: customerData.email },
              { contactNumber: customerData.contactNumber },
              { customerId: customerId },
            ],
          });

          if (existingCustomer) {
            return existingCustomer;
          }
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in findOrCreateCustomer:", error);
    throw error;
  }
};

/**
 * Instance method to update customer statistics
 */
customerSchema.methods.updateStatistics = async function () {
  try {
    // Get all projects for this customer
    const Project = require("../project/Project");

    // Use customerId for linking projects, with email fallback for backward compatibility
    const query = this.customerId
      ? { $or: [{ customerId: this.customerId }, { email: this.email }] }
      : { email: this.email };

    const projects = await Project.find(query);

    // Update total projects
    this.totalProjects = projects.length;

    // Calculate total spent
    this.totalSpent = projects.reduce(
      (total, project) => total + (project.projectAmount || 0),
      0
    );

    // Update services used
    const servicesSet = new Set();
    projects.forEach((project) => {
      if (project.services) {
        servicesSet.add(project.services);
      }
    });
    this.services = Array.from(servicesSet);

    // Update projects array
    this.projects = projects.map((p) => p._id);

    // Update projects to reference this customer's customerId if they don't already
    const projectsWithoutCustomerId = projects.filter(
      (p) => !p.customerId || p.customerId !== this.customerId
    );
    if (projectsWithoutCustomerId.length > 0 && this.customerId) {
      await Project.updateMany(
        { _id: { $in: projectsWithoutCustomerId.map((p) => p._id) } },
        { customerId: this.customerId }
      );
    }

    await this.save();
    return this;
  } catch (error) {
    console.error("Error updating customer statistics:", error);
    throw error;
  }
};

module.exports = mongoose.model("Customer", customerSchema);
