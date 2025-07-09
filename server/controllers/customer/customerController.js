const Customer = require("../../models/customer/Customer");
const generateCustomerId = require("../../utils/helpers/customerIdGenerator");
/**
 * Customer Controller
 * Handles all CRUD operations for customers
 */

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      service = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      service,
      status,
      sortBy,
      sortOrder,
    };

    // Get customers with filters
    const customers = await Customer.getCustomersWithFilters({}, options);

    // Get total count for pagination
    const totalCustomers = await Customer.getCustomersCount({
      search,
      service,
      status,
    });

    const totalPages = Math.ceil(totalCustomers / limit);

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCustomers,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customers",
    });
  }
};

/**
 * @desc    Get single customer
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: "projects",
        select:
          "projectStatus services address projectAmount projectDate progress assignedEmployees completedTasks totalTasks",
        populate: {
          path: "assignedEmployees",
          select: "firstName lastName email avatar",
        },
      })
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer",
    });
  }
};

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res) => {
  try {
    const {
      customerName,
      contactNumber,
      email,
      address,
      notes,
      status = "Active",
    } = req.body;
    const customerId = await generateCustomerId({
      email,
      mobileNo: contactNumber,
    });
    // Validate required fields
    if (!customerName || !contactNumber || !email || !address) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (customerName, contactNumber, email, address)",
      });
    }

    // Parse address if it's a string
    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid address format",
        });
      }
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    // Create customer data
    const customerData = {
      customerId,
      customerName,
      contactNumber,
      email,
      address: parsedAddress,
      notes,
      status,
    };

    const customer = await Customer.create(customerData);

    // Link existing projects to this customer and update statistics
    await customer.updateStatistics();

    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("Create customer error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating customer",
    });
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res) => {
  try {
    const { customerName, contactNumber, email, address, notes, status } =
      req.body;

    // Find customer
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Parse address if it's a string
    let parsedAddress = address;
    if (address && typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid address format",
        });
      }
    }

    // Update customer data
    const updateData = {};
    if (customerName) updateData.customerName = customerName;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (email) updateData.email = email;
    if (parsedAddress) updateData.address = parsedAddress;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    // Check if email is being changed and if new email already exists
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "Customer with this email already exists",
        });
      }
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Update customer statistics after update
    await customer.updateStatistics();

    res.status(200).json({
      success: true,
      data: customer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Update customer error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating customer",
    });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if customer has projects
    if (customer.projects && customer.projects.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete customer with existing projects",
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting customer",
    });
  }
};

/**
 * @desc    Get customer statistics
 * @route   GET /api/customers/stats
 * @access  Private
 */
const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalSpent: { $sum: "$totalSpent" },
        },
      },
    ]);

    const totalCustomers = await Customer.countDocuments();
    const totalRevenue = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalSpent" },
        },
      },
    ]);

    // Service breakdown
    const serviceStats = await Customer.aggregate([
      { $unwind: "$services" },
      {
        $group: {
          _id: "$services",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        serviceBreakdown: serviceStats,
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get customer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer statistics",
    });
  }
};

/**
 * @desc    Update customer statistics (refresh from projects)
 * @route   POST /api/customers/:id/update-stats
 * @access  Private
 */
const updateCustomerStats = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const updatedCustomer = await customer.updateStatistics();

    res.status(200).json({
      success: true,
      data: updatedCustomer,
      message: "Customer statistics updated successfully",
    });
  } catch (error) {
    console.error("Update customer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating customer statistics",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  updateCustomerStats,
};
