const express = require("express");
const {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  updateProposalField,
  deleteProposal,
  getProposalStats,
} = require("../../controllers/proposal/proposalController");
const { handleProposalUpload } = require("../../middleware/upload");
const authenticateToken = require("../../middleware/authMiddleware");

/**
 * Proposal Routes
 * Defines all API endpoints for proposal operations
 * Includes file upload handling and proper middleware
 */

const router = express.Router();

/**
 * @route   GET /api/proposals/stats
 * @desc    Get proposal statistics
 * @access  Private
 * @note    Must be before /:id route to avoid conflicts
 */
router.get("/stats", authenticateToken, getProposalStats);

/**
 * @route   GET /api/proposals
 * @desc    Get all proposals with filtering and pagination
 * @access  Private
 * @query   page, limit, sortBy, sortOrder, search, status, dateFrom, dateTo, service
 */
router.get("/", authenticateToken, getProposals);

/**
 * @route   POST /api/proposals
 * @desc    Create new proposal
 * @access  Private
 * @body    customerName, contactNumber, email, address, services, projectDescription, projectAmount, size, status, comment, date
 * @file    attachment (optional)
 */
router.post("/", authenticateToken, handleProposalUpload, createProposal);

/**
 * @route   GET /api/proposals/:id
 * @desc    Get single proposal by ID
 * @access  Private
 * @param   id - Proposal ID
 */
router.get("/:id", authenticateToken, getProposal);

/**
 * @route   PUT /api/proposals/:id
 * @desc    Update proposal
 * @access  Private
 * @param   id - Proposal ID
 * @body    Any proposal fields to update
 * @file    attachment (optional)
 */
router.put("/:id", authenticateToken, handleProposalUpload, updateProposal);

/**
 * @route   PATCH /api/proposals/:id/field
 * @desc    Update specific field of proposal (for inline editing)
 * @access  Private
 * @param   id - Proposal ID
 * @body    field, value
 */
router.patch("/:id/field", authenticateToken, updateProposalField);

/**
 * @route   DELETE /api/proposals/:id
 * @desc    Delete proposal
 * @access  Private
 * @param   id - Proposal ID
 */
router.delete("/:id", authenticateToken, deleteProposal);

module.exports = router;
