const express = require("express");
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  updateCustomerStats,
} = require("../../controllers/customer/customerController");

const router = express.Router();

/**
 * Customer Routes
 * All routes for customer management
 */

// @route   GET /api/customers/stats
// @desc    Get customer statistics
// @access  Private
router.get("/stats", getCustomerStats);

// @route   GET /api/customers
// @desc    Get all customers with filtering and pagination
// @access  Private
router.get("/", getCustomers);

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get("/:id", getCustomer);

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post("/", createCustomer);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put("/:id", updateCustomer);

// @route   POST /api/customers/:id/update-stats
// @desc    Update customer statistics from projects
// @access  Private
router.post("/:id/update-stats", updateCustomerStats);

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete("/:id", deleteCustomer);

module.exports = router;
