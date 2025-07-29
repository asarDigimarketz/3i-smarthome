const Proposal = require("../../models/proposal/Proposal");
const Project = require("../../models/project/Project");
const Customer = require("../../models/customer/Customer");
const FCMToken = require("../../models/fcmToken");
const User = require("../../models/user");
const UserEmployee = require("../../models/employeeManagement/UserEmployeeSchema");
const {
  deleteFile,
  getFileUrl,
  handleFileUpdate,
} = require("../../middleware/upload");
const { createProposalNotification } = require("../../services/notificationService");
const path = require("path");

// Helper function to convert all values to strings for FCM
function convertToFCMData(data) {
  const fcmData = {};
  for (const [key, value] of Object.entries(data)) {
    fcmData[key] = String(value);
  }
  return fcmData;
}

// Helper function to get admin users
async function getAllAdminUsers() {
  try {
    const adminUsers = await User.find({
      $or: [
        { isAdmin: true },
        { role: { $in: ['admin', 'hotel admin', 'super admin'] } }
      ]
    });
    return adminUsers.map(user => user._id);
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
}

// Helper function to send FCM notifications for proposals
async function sendProposalNotification(userIds, notification) {
  try {
    if (!userIds || userIds.length === 0) {
      console.log('No users to send proposal notification to');
      return;
    }

    // console.log('User IDs for proposal notification:', userIds);

    // Save notifications to database first
    try {
      const savedNotifications = await createProposalNotification({
        type: notification.type || 'proposal',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'medium',
        proposalId: notification.proposalId,
        triggeredBy: notification.triggeredBy,
        triggeredByModel: notification.triggeredByModel
      });
      console.log(`Saved ${savedNotifications.length} proposal notifications to database`);
    } catch (dbError) {
      console.error('Error saving proposal notifications to database:', dbError);
      // Continue with FCM sending even if database save fails
    }

    // Get FCM tokens for the users
    const tokens = await FCMToken.find({
      userId: { $in: userIds },
      isActive: true,
    });

    if (tokens.length === 0) {
      console.log(`No active FCM tokens found for User IDs: ${userIds.join(', ')}`);
      return;
    }

    const tokenList = tokens.map(t => t.token);
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually
    for (const token of tokenList) {
      try {
        // Convert all data values to strings for FCM compatibility
        const fcmData = convertToFCMData({
          type: notification.type || 'proposal',
          proposalId: notification.proposalId || '',
          ...notification.data,
        });

        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: fcmData,
          token: token,
        };

        // Get Firebase Admin instance
        const admin = require('firebase-admin');
        await admin.messaging().send(message);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to token ${token}:`, error);
        failureCount++;
        
        // Remove failed token
        await FCMToken.deleteOne({ token });
      }
    }

    console.log(`Proposal notification sent: ${successCount} successful, ${failureCount} failed`);

    if (failureCount > 0) {
      console.log(`Removed ${failureCount} failed FCM tokens`);
    }

    return {
      success: true,
      sent: successCount,
      failed: failureCount
    };
  } catch (error) {
    console.error('Error sending proposal FCM notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Proposal Controller
 * Handles all CRUD operations for proposals
 * Based on client component requirements
 */

/**
 * @desc    Create new proposal
 * @route   POST /api/proposals
 * @access  Private
 */
const createProposal = async (req, res) => {
  try {
    const {
      customerName,
      contactNumber,
      email,
      address,
      services,
      projectDescription,
      projectAmount,
      size,
      status,
      comment,
      date,
      amountOptions,
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !contactNumber ||
      !email ||
      !address ||
      !services ||
      !projectDescription ||
      !projectAmount ||
      !size
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields",
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
          error: "Invalid address format",
        });
      }
    }

    // Parse amountOptions if it's a string
    let parsedAmountOptions = amountOptions;
    if (typeof amountOptions === "string") {
      try {
        parsedAmountOptions = JSON.parse(amountOptions);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid amount options format",
        });
      }
    }

    // Create proposal data object
    const proposalData = {
      customerName,
      contactNumber,
      email,
      address: parsedAddress,
      services,
      projectDescription,
      projectAmount: parseFloat(projectAmount),
      size,
      status: status || "Warm",
      comment,
      date: date ? new Date(date) : new Date(),
      amountOptions: parsedAmountOptions,
    };

    // Add file information if files were uploaded (multiple attachments)
    if (req.filesInfo && req.filesInfo.length > 0) {
      proposalData.attachments = req.filesInfo.map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/assets/images/proposals/project-attachments/${file.filename}`,
      }));
    }
    // If attachments sent as JSON (for edit mode), merge with new files
    if (req.body.attachments && typeof req.body.attachments === "string") {
      try {
        const existingAttachments = JSON.parse(req.body.attachments);
        proposalData.attachments = [
          ...(proposalData.attachments || []),
          ...existingAttachments,
        ];
      } catch (e) {
        // ignore parse error
      }
    }
    // Remove old single attachment field if present
    delete proposalData.attachment;

    // Create proposal
    const proposal = await Proposal.create(proposalData);

    // Send notifications to users with proposal permissions
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('proposals', 'i') },
            'actions.view': true
          }
        }
      });

      const employeeUserIds = employeesWithPermission.map(emp => emp._id);
      const allUserIds = [...adminUserIds, ...employeeUserIds];
      const recipientUserIds = allUserIds.filter(userId => 
        userId.toString() !== (req.user ? req.user.id.toString() : '')
      );

      if (recipientUserIds.length > 0) {
        const notification = {
          type: 'proposal_created',
          title: 'New Proposal Created',
          body: `A new proposal "${customerName}" has been created by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            proposalId: proposal._id.toString(),
            customerName: customerName,
            projectAmount: parseFloat(projectAmount),
            services: services,
            createdBy: req.user ? req.user.name || req.user.email : 'Unknown',
            proposalDetails: {
              customerName: customerName,
              contactNumber: contactNumber,
              email: email,
              services: services,
              projectAmount: parseFloat(projectAmount),
              size: size,
              status: status || 'Warm'
            }
          },
          priority: 'medium',
          proposalId: proposal._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProposalNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending proposal notification:', notificationError);
      // Don't fail the proposal creation if notification fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        proposal,
        attachmentUrl: proposal.attachment
          ? getFileUrl(proposal.attachment.filename)
          : null,
      },
      message: "Proposal created successfully",
    });
  } catch (error) {
    // If there was an error and file was uploaded, clean up the file
    if (req.fileInfo) {
      await deleteFile(req.fileInfo.path).catch(console.error);
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(". "),
      });
    }

    console.error("Create proposal error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while creating proposal",
    });
  }
};

/**
 * @desc    Get all proposals with filtering and pagination
 * @route   GET /api/proposals
 * @access  Private
 */
const getProposals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      status = "",
      dateFrom = "",
      dateTo = "",
      service = "",
    } = req.query;

    // Prepare filter options
    const filterOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      status,
      dateFrom,
      dateTo,
    };

    // Add service filter if provided
    let additionalFilters = {};
    if (service) {
      additionalFilters.services = service;
    }

    // Get proposals with filters
    const proposals = await Proposal.getProposalsWithFilters(
      additionalFilters,
      filterOptions
    );

    // Get total count for pagination
    const total = await Proposal.getProposalsCount({
      search,
      status,
      dateFrom,
      dateTo,
      ...additionalFilters,
    });

    // Add file URLs to proposals
    const proposalsWithUrls = proposals.map((proposal) => ({
      ...proposal,
      attachments: proposal.attachments
        ? proposal.attachments.map((att) => ({
            ...att,
            url:
              att.url || (att.filename ? getFileUrl(att.filename) : undefined),
          }))
        : [],
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        proposals: proposalsWithUrls,
        pagination: {
          current: parseInt(page),
          total: totalPages,
          count: total,
          limit: parseInt(limit),
          hasNext: hasNextPage,
          hasPrev: hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Get proposals error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching proposals",
    });
  }
};

/**
 * @desc    Get single proposal by ID
 * @route   GET /api/proposals/:id
 * @access  Private
 */
const getProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: "Proposal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        proposal: {
          ...proposal.toObject(),
          attachments: proposal.attachments
            ? proposal.attachments.map((att) => ({
                ...att,
                url:
                  att.url ||
                  (att.filename ? getFileUrl(att.filename) : undefined),
              }))
            : [],
        },
      },
    });
  } catch (error) {
    console.error("Get proposal error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching proposal",
    });
  }
};

/**
 * @desc    Update proposal
 * @route   PUT /api/proposals/:id
 * @access  Private
 */
const updateProposal = async (req, res) => {
  // Windows absolute path fix: if filePath is absolute and starts with D:\ or C:\, use as is, else join with __dirname
  function normalizeFilePath(filePath) {
    if (!filePath) return null;
    if (path.isAbsolute(filePath)) return filePath;
    if (/^[A-Za-z]:\\/.test(filePath)) return filePath;
    return path.join(__dirname, "../public", filePath);
  }

  try {
    let proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: "Proposal not found",
      });
    }

    // Store old file info for cleanup if new file is uploaded
    const oldAttachments = proposal.attachments || [];

    // Prepare update data
    const updateData = { ...req.body };

    // Parse address if it's a string
    if (updateData.address && typeof updateData.address === "string") {
      try {
        updateData.address = JSON.parse(updateData.address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid address format",
        });
      }
    }

    // Parse amountOptions if it's a string
    if (
      updateData.amountOptions &&
      typeof updateData.amountOptions === "string"
    ) {
      try {
        updateData.amountOptions = JSON.parse(updateData.amountOptions);
      } catch (error) {
        // Keep existing amountOptions if parsing fails
        delete updateData.amountOptions;
      }
    }

    // Convert projectAmount to number if provided
    if (updateData.projectAmount) {
      updateData.projectAmount = parseFloat(updateData.projectAmount);
    }

    // DEBUG: Log the incoming removeAttachments field

    // Remove attachments if requested (like project logic)
    let baseAttachments = proposal.attachments ? [...proposal.attachments] : [];
    if (req.body.removeAttachments) {
      try {
        const removeList = JSON.parse(req.body.removeAttachments);

        if (Array.isArray(removeList) && proposal.attachments) {
          proposal.attachments.forEach((att) => {
            if (removeList.includes(att.filename) && att.path) {
              let absPath = att.path;
              if (!path.isAbsolute(absPath)) {
                absPath = path.join(__dirname, "../public", att.path);
              }

              if (require("fs").existsSync(absPath)) {
                require("fs").unlinkSync(absPath);
              } else {
                console.warn("[Proposal Attachment Not Found]", absPath);
              }
            }
          });
          baseAttachments = proposal.attachments.filter(
            (att) => !removeList.includes(att.filename)
          );
          updateData.attachments = baseAttachments;
        }
      } catch (err) {
        console.error("Failed to remove attachments:", err);
      }
    }

    // Handle multiple file uploads (attachments)
    // Remove attachments marked for deletion from baseAttachments (legacy, can be removed if not used)
    let removedAttachments = [];
    if (
      req.body.removedAttachments &&
      typeof req.body.removedAttachments === "string"
    ) {
      try {
        removedAttachments = JSON.parse(req.body.removedAttachments);
      } catch (e) {
        removedAttachments = [];
      }
    }
    if (removedAttachments.length > 0 && Array.isArray(baseAttachments)) {
      baseAttachments = baseAttachments.filter((att) => {
        return !removedAttachments.some(
          (remAtt) =>
            (remAtt._id && att._id && remAtt._id === att._id) ||
            (remAtt.filename &&
              att.filename &&
              remAtt.filename === att.filename)
        );
      });
      for (const remAtt of removedAttachments) {
        // Try to get the correct path from the original proposal.attachments if not present
        let filePath = remAtt.path;
        if (!filePath) {
          const found = (proposal.attachments || []).find(
            (att) =>
              (remAtt._id && att._id && remAtt._id === att._id) ||
              (remAtt.filename &&
                att.filename &&
                remAtt.filename === att.filename)
          );
          if (found && found.path) filePath = found.path;
        }
        filePath = normalizeFilePath(filePath);
        if (filePath) {
          await handleFileUpdate(filePath);
        }
      }
    }
    // Add new uploaded files
    if (req.filesInfo && req.filesInfo.length > 0) {
      const newAttachments = req.filesInfo.map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/assets/images/proposals/project-attachments/${file.filename}`,
      }));
      baseAttachments = baseAttachments.concat(newAttachments);
    }
    updateData.attachments = baseAttachments;
    // Remove old single attachment field if present
    delete updateData.attachment;

    // Store original proposal data for comparison
    const originalProposal = await Proposal.findById(req.params.id);

    // Update proposal
    proposal = await Proposal.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // If new file was uploaded, delete old file
    if (req.filesInfo && oldAttachments.length > 0) {
      for (const oldFile of oldAttachments) {
        await handleFileUpdate(oldFile.path);
      }
    }

    // Send notifications for proposal updates
    try {
      // Determine what was changed
      const changes = [];
      if (updateData.customerName && updateData.customerName !== originalProposal.customerName) changes.push('customer name');
      if (updateData.projectAmount && updateData.projectAmount !== originalProposal.projectAmount) changes.push('project amount');
      if (updateData.services && updateData.services !== originalProposal.services) changes.push('services');
      if (updateData.status && updateData.status !== originalProposal.status) changes.push('status');
      if (updateData.comment !== undefined && updateData.comment !== originalProposal.comment) changes.push('comment');
      
      const changesText = changes.length > 0 ? changes.join(', ') : 'details';
      
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('proposals', 'i') },
            'actions.view': true
          }
        }
      });

      const employeeUserIds = employeesWithPermission.map(emp => emp._id);
      const allUserIds = [...adminUserIds, ...employeeUserIds];
      const recipientUserIds = allUserIds.filter(userId => 
        userId.toString() !== (req.user ? req.user.id.toString() : '')
      );

      if (recipientUserIds.length > 0) {
        const notification = {
          type: 'proposal_updated',
          title: 'Proposal Updated',
          body: `Proposal "${proposal.customerName}" ${changesText} has been updated by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            proposalId: proposal._id.toString(),
            customerName: proposal.customerName,
            projectAmount: proposal.projectAmount,
            services: proposal.services,
            updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            changes: {
              fields: changes,
              previousData: {
                customerName: originalProposal.customerName,
                projectAmount: originalProposal.projectAmount,
                services: originalProposal.services,
                status: originalProposal.status,
                comment: originalProposal.comment
              },
              newData: {
                customerName: proposal.customerName,
                projectAmount: proposal.projectAmount,
                services: proposal.services,
                status: proposal.status,
                comment: proposal.comment
              }
            }
          },
          priority: 'medium',
          proposalId: proposal._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProposalNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending proposal update notification:', notificationError);
      // Don't fail the proposal update if notification fails
    }

    // Check if status changed to "Confirmed" and create project automatically
    if (updateData.status === "Confirmed") {
      try {
        // Check if project already exists for this proposal
        const existingProject = await Project.findOne({
          proposalId: proposal._id,
        });

        if (!existingProject) {
          // Create project from proposal data
          const projectData = {
            proposalId: proposal._id,
            customerName: proposal.customerName,
            contactNumber: proposal.contactNumber,
            email: proposal.email,
            address: proposal.address,
            services: proposal.services,
            projectDescription: proposal.projectDescription,
            projectAmount: proposal.projectAmount,
            size: proposal.size,
            comment: proposal.comment,
            projectStatus: "new",
            projectDate: new Date(),
            proposalDate: proposal.date,
          };

          // Copy attachment if exists
          if (proposal.attachment) {
            projectData.attachment = proposal.attachment;
          }

          // Create or update customer automatically
          const customerData = {
            customerName: proposal.customerName,
            contactNumber: proposal.contactNumber,
            email: proposal.email,
            address: proposal.address,
          };

          const customer = await Customer.findOrCreateCustomer(customerData);

          // Add customer reference to project data
          projectData.customerId = customer.customerId;

          // Create the project
          const project = await Project.create(projectData);

          // Update customer statistics
          await customer.updateStatistics();

          // Return response with project info
          return res.status(200).json({
            success: true,
            data: {
              proposal,
              project,
              customer,
              attachmentUrl: proposal.attachment
                ? getFileUrl(proposal.attachment.filename)
                : null,
            },
            message:
              "Proposal updated successfully and project created automatically",
          });
        }
      } catch (projectError) {
        console.error(
          "Error creating project from confirmed proposal:",
          projectError
        );
        // Continue with normal response even if project creation fails
      }
    }

    res.status(200).json({
      success: true,
      data: {
        proposal,
        attachmentUrl: proposal.attachment
          ? getFileUrl(proposal.attachment.filename)
          : null,
      },
      message: "Proposal updated successfully",
    });
  } catch (error) {
    // If there was an error and file was uploaded, clean up the new file
    if (req.fileInfo) {
      await deleteFile(req.fileInfo.path).catch(console.error);
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(". "),
      });
    }

    console.error("Update proposal error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating proposal",
    });
  }
};

/**
 * @desc    Update specific field of proposal (for inline editing)
 * @route   PATCH /api/proposals/:id/field
 * @access  Private
 */
const updateProposalField = async (req, res) => {
  try {
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({
        success: false,
        error: "Field name and value are required",
      });
    }

    // Allowed fields for inline editing
    const allowedFields = [
      "comment",
      "projectAmount",
      "status",
      "amountOptions",
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        error: "Field is not allowed for inline editing",
      });
    }

    let proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: "Proposal not found",
      });
    }

    // Store old status to check if it changed to "Confirmed"
    const oldStatus = proposal.status;

    // Prepare update data
    const updateData = {};

    // Special handling for different field types
    if (field === "projectAmount") {
      updateData[field] = parseFloat(value);
    } else if (field === "amountOptions") {
      // Handle array of amount options
      updateData[field] = Array.isArray(value) ? value : [value];
    } else {
      updateData[field] = value;
    }

    // Store original proposal data for comparison
    const originalProposal = await Proposal.findById(req.params.id);

    // Update proposal
    proposal = await Proposal.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Send notifications for proposal field updates
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('proposals', 'i') },
            'actions.view': true
          }
        }
      });

      const employeeUserIds = employeesWithPermission.map(emp => emp._id);
      const allUserIds = [...adminUserIds, ...employeeUserIds];
      const recipientUserIds = allUserIds.filter(userId => 
        userId.toString() !== (req.user ? req.user.id.toString() : '')
      );

      if (recipientUserIds.length > 0) {
        const notification = {
          type: 'proposal_field_updated',
          title: 'Proposal Field Updated',
          body: `Proposal "${proposal.customerName}" ${field} has been updated to "${value}" by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            proposalId: proposal._id.toString(),
            customerName: proposal.customerName,
            field: field,
            oldValue: originalProposal[field],
            newValue: value,
            updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            changes: {
              field: field,
              previousValue: originalProposal[field],
              newValue: value
            }
          },
          priority: 'medium',
          proposalId: proposal._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProposalNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending proposal field update notification:', notificationError);
      // Don't fail the proposal field update if notification fails
    }

    // Check if status changed to "Confirmed" and create project automatically
    if (
      field === "status" &&
      value === "Confirmed" &&
      oldStatus !== "Confirmed"
    ) {
      try {
        // Check if project already exists for this proposal
        const existingProject = await Project.findOne({
          proposalId: proposal._id,
        });

        if (!existingProject) {
          // Create project from proposal data
          const projectData = {
            proposalId: proposal._id,
            customerName: proposal.customerName,
            contactNumber: proposal.contactNumber,
            email: proposal.email,
            address: proposal.address,
            services: proposal.services,
            projectDescription: proposal.projectDescription,
            projectAmount: proposal.projectAmount,
            size: proposal.size,
            comment: proposal.comment,
            projectStatus: "new",
            projectDate: new Date(),
            proposalDate: proposal.date,
          };

          // Copy attachment if exists
          if (proposal.attachment) {
            projectData.attachment = proposal.attachment;
          }

          // Create or update customer automatically
          const customerData = {
            customerName: proposal.customerName,
            contactNumber: proposal.contactNumber,
            email: proposal.email,
            address: proposal.address,
          };

          const customer = await Customer.findOrCreateCustomer(customerData);

          // Add customer reference to project data
          projectData.customerId = customer.customerId;

          // Create the project
          const project = await Project.create(projectData);

          // Update customer statistics
          await customer.updateStatistics();

          // Add project info to response
          return res.status(200).json({
            success: true,
            data: {
              proposal,
              project,
              customer,
              attachmentUrl: proposal.attachment
                ? getFileUrl(proposal.attachment.filename)
                : null,
            },
            message: `${field} updated successfully and project created automatically`,
          });
        }
      } catch (projectError) {
        console.error(
          "Error creating project from confirmed proposal:",
          projectError
        );
        // Continue with normal response even if project creation fails
        // The proposal update was successful
      }
    }

    res.status(200).json({
      success: true,
      data: {
        proposal,
        attachmentUrl: proposal.attachment
          ? getFileUrl(proposal.attachment.filename)
          : null,
      },
      message: `${field} updated successfully`,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(". "),
      });
    }

    console.error("Update proposal field error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating proposal field",
    });
  }
};

/**
 * @desc    Delete proposal
 * @route   DELETE /api/proposals/:id
 * @access  Private
 */
const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: "Proposal not found",
      });
    }

    // Store proposal data before deletion for notification
    const proposalData = {
      _id: proposal._id,
      customerName: proposal.customerName,
      projectAmount: proposal.projectAmount,
      services: proposal.services,
      status: proposal.status
    };

    // Delete associated file if exists
    if (proposal.attachment && proposal.attachment.path) {
      await deleteFile(proposal.attachment.path).catch(console.error);
    }

    // Delete proposal
    await Proposal.findByIdAndDelete(req.params.id);

    // Send notifications for proposal deletion
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('proposals', 'i') },
            'actions.view': true
          }
        }
      });

      const employeeUserIds = employeesWithPermission.map(emp => emp._id);
      const allUserIds = [...adminUserIds, ...employeeUserIds];
      const recipientUserIds = allUserIds.filter(userId => 
        userId.toString() !== (req.user ? req.user.id.toString() : '')
      );

      if (recipientUserIds.length > 0) {
        const notification = {
          type: 'proposal_deleted',
          title: 'Proposal Deleted',
          body: `Proposal "${proposalData.customerName}" has been deleted by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            proposalId: proposalData._id.toString(),
            customerName: proposalData.customerName,
            projectAmount: proposalData.projectAmount,
            services: proposalData.services,
            deletedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            proposalDetails: {
              customerName: proposalData.customerName,
              projectAmount: proposalData.projectAmount,
              services: proposalData.services,
              status: proposalData.status
            }
          },
          priority: 'high',
          proposalId: proposalData._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProposalNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending proposal deletion notification:', notificationError);
      // Don't fail the proposal deletion if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Proposal deleted successfully",
    });
  } catch (error) {
    console.error("Delete proposal error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting proposal",
    });
  }
};

/**
 * @desc    Get proposal statistics
 * @route   GET /api/proposals/stats
 * @access  Private
 */
const getProposalStats = async (req, res) => {
  try {
    const stats = await Proposal.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$projectAmount" },
        },
      },
    ]);

    const totalProposals = await Proposal.countDocuments();
    const totalAmount = await Proposal.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$projectAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalProposals,
        totalAmount: totalAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get proposal stats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching proposal statistics",
    });
  }
};

module.exports = {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  updateProposalField,
  deleteProposal,
  getProposalStats,
};
