const fs = require("fs");
const path = require("path");
const Project = require("../../models/project/Project");
const Proposal = require("../../models/proposal/Proposal");
const Customer = require("../../models/customer/Customer");
const FCMToken = require("../../models/fcmToken");
const User = require("../../models/user");
const UserEmployee = require("../../models/employeeManagement/UserEmployeeSchema");
const generateCustomerId = require("../../utils/helpers/customerIdGenerator");
const { createProjectNotification } = require("../../services/notificationService");

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

// Helper function to send FCM notifications to users with project permissions
async function sendProjectNotification(userIds, notification) {
  try {
    if (!userIds || userIds.length === 0) {
      console.log('No users to send project notification to');
      return;
    }

    console.log('User IDs for project notification:', userIds);

    // Save notifications to database first
    try {
      const savedNotifications = await createProjectNotification({
        type: notification.type || 'project',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'medium',
        projectId: notification.projectId,
        triggeredBy: notification.triggeredBy,
        triggeredByModel: notification.triggeredByModel
      });
      console.log(`Saved ${savedNotifications.length} project notifications to database`);
    } catch (dbError) {
      console.error('Error saving project notifications to database:', dbError);
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
          type: notification.type || 'project',
          projectId: notification.projectId || '',
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

    console.log(`Project notification sent: ${successCount} successful, ${failureCount} failed`);

    if (failureCount > 0) {
      console.log(`Removed ${failureCount} failed FCM tokens`);
    }

    return {
      success: true,
      sent: successCount,
      failed: failureCount
    };
  } catch (error) {
    console.error('Error sending project FCM notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Project Controller
 * Handles all CRUD operations for projects
 */

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
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
      comment,
      projectStatus,
      projectDate,
      proposalId, // Optional, when creating from proposal
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
        message: "Please provide all required fields",
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

    // Create project data
    const projectData = {
      customerName,
      contactNumber,
      email,
      address: parsedAddress,
      services,
      projectDescription,
      projectAmount: parseFloat(projectAmount),
      size,
      comment,
      projectStatus: projectStatus || "new",
      projectDate: projectDate ? new Date(projectDate) : new Date(),
      proposalId: proposalId || null,
    };

    // Add file information if files were uploaded (multiple attachments)
    if (req.filesInfo && req.filesInfo.length > 0) {
      projectData.attachments = req.filesInfo.map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/assets/images/projects/attachments/${file.filename}`,
      }));
    }

    // If created from proposal, add proposal date
    if (proposalId) {
      const proposal = await Proposal.findById(proposalId);
      if (proposal) {
        projectData.proposalDate = proposal.date;
      }
    }

    // Create or update customer automatically
    const customerData = {
      customerName,
      contactNumber,
      email,
      address: parsedAddress,
    };

    const customer = await Customer.findOrCreateCustomer(customerData);

    // Add customer reference to project data
    projectData.customerId = customer.customerId;

    // Create the project
    const project = await Project.create(projectData);

    // Update customer statistics
    await customer.updateStatistics();

    // Send notifications to users with project permissions
    try {
      await createProjectNotification({
        type: 'project_created',
        title: 'New Project Created',
        body: `A new project "${customerName}" has been created by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
        data: {
          projectId: project._id.toString(),
          customerName: customerName,
          projectAmount: parseFloat(projectAmount),
          services: services,
          createdBy: req.user ? req.user.name || req.user.email : 'Unknown',
          projectDetails: {
            customerName: customerName,
            contactNumber: contactNumber,
            email: email,
            services: services,
            projectAmount: parseFloat(projectAmount),
            size: size,
            projectStatus: projectStatus || 'new'
          }
        },
        priority: 'medium',
        projectId: project._id.toString(),
        triggeredBy: req.user ? req.user.id : null,
        triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
      });
    } catch (notificationError) {
      console.error('Error sending project notification:', notificationError);
      // Don't fail the project creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
      customer: customer,
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating project",
    });
  }
};

/**
 * @desc    Create project from confirmed proposal
 * @route   POST /api/projects/from-proposal/:proposalId
 * @access  Private
 */
const createProjectFromProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Find the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    // Check if proposal is confirmed
    if (proposal.status !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed proposals can be converted to projects",
      });
    }

    // Check if project already exists for this proposal
    const existingProject = await Project.findOne({ proposalId });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "Project already exists for this proposal",
      });
    }

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

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully from proposal",
      customer: customer,
    });
  } catch (error) {
    console.error("Create project from proposal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating project from proposal",
    });
  }
};

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      status = "",
      service = "",
      startDate = "",
      endDate = "",
      assignedEmployees = "",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      status,
      service,
      startDate,
      endDate,
    };

    // Build filter for assignedEmployees if present
    const filter = {};
    if (assignedEmployees) {
      filter["assignedEmployees"] = assignedEmployees;
    }

    const projects = await Project.getProjectsWithFilters(filter, options);

    // Get total count for pagination (exclude empty filter fields)
    const countFilters = { ...filter };
    if (search) countFilters.search = search;
    if (status) countFilters.status = status;
    if (service) countFilters.service = service;
    if (startDate) countFilters.startDate = startDate;
    if (endDate) countFilters.endDate = endDate;
    const total = await Project.getProjectsCount(countFilters);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        count: total,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("proposalId")
      .populate({
        path: "assignedEmployees",
        select: "firstName lastName email avatar",
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching project",
    });
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Parse address if it's a string
    let updateData = { ...req.body };
    if (updateData.address && typeof updateData.address === "string") {
      try {
        updateData.address = JSON.parse(updateData.address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid address format",
        });
      }
    }

    // Remove attachments if requested
    if (req.body.removeAttachments) {
      try {
        const removeList = JSON.parse(req.body.removeAttachments);
        if (Array.isArray(removeList) && project.attachments) {
          project.attachments.forEach((att) => {
            if (removeList.includes(att.filename) && att.filename) {
              const absPath = path.join(
                __dirname,
                "../../public/assets/images/projects/attachments/",
                att.filename
              );
              if (fs.existsSync(absPath)) {
                fs.unlinkSync(absPath);
              }
            }
          });
          updateData.attachments = project.attachments.filter(
            (att) => !removeList.includes(att.filename)
          );
        }
      } catch (err) {
        console.error("Failed to remove attachments:", err);
      }
    }

    // 1. If attachments is sent as a JSON string (for full replacement), use as base
    let baseAttachments = [];
    if (typeof req.body.attachments === "string") {
      try {
        const newAttachments = JSON.parse(req.body.attachments);
        if (Array.isArray(newAttachments)) {
          baseAttachments = newAttachments;
        }
      } catch (e) {
        // ignore parse error, fallback to empty array
      }
    }

    // 2. Add new files if uploaded (multiple attachments)
    if (req.filesInfo && req.filesInfo.length > 0) {
      const newAttachments = req.filesInfo.map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/assets/images/projects/attachments/${file.filename}`,
      }));
      baseAttachments = baseAttachments.concat(newAttachments);
    }
    updateData.attachments = baseAttachments;

    // 3. Remove attachments from disk if requested (but do not update DB list here)
    if (req.body.removeAttachments) {
      try {
        const removeList = JSON.parse(req.body.removeAttachments);
        if (Array.isArray(removeList) && project.attachments) {
          project.attachments.forEach((att) => {
            if (removeList.includes(att.filename) && att.filename) {
              const absPath = path.join(
                __dirname,
                "../../public/assets/images/projects/attachments/",
                att.filename
              );
              if (fs.existsSync(absPath)) {
                fs.unlinkSync(absPath);
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to remove attachments:", err);
      }
    }

    // Validate required fields only if they are being updated
    const requiredFields = [
      "customerName",
      "contactNumber",
      "email",
      "address",
      "services",
      "projectDescription",
      "projectAmount",
      "size",
    ];
    for (const field of requiredFields) {
      if (
        field in updateData &&
        updateData[field] !== undefined &&
        updateData[field] !== null &&
        (!updateData[field] || updateData[field] === "")
      ) {
        return res.status(400).json({
          success: false,
          message: `Field '${field}' is required`,
        });
      }
    }

    // Store original project data for comparison
    const originalProject = await Project.findById(req.params.id);

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Send notifications for project updates
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('projects', 'i') },
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
        // Determine what was changed
        const changes = [];
        if (updateData.customerName && updateData.customerName !== originalProject.customerName) changes.push('customer name');
        if (updateData.projectAmount && updateData.projectAmount !== originalProject.projectAmount) changes.push('project amount');
        if (updateData.services && updateData.services !== originalProject.services) changes.push('services');
        if (updateData.projectStatus && updateData.projectStatus !== originalProject.projectStatus) changes.push('project status');
        if (updateData.comment !== undefined && updateData.comment !== originalProject.comment) changes.push('comment');
        
        const changesText = changes.length > 0 ? changes.join(', ') : 'details';
        
        const notification = {
          type: 'project_updated',
          title: 'Project Updated',
          body: `Project "${project.customerName}" ${changesText} has been updated by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            projectId: project._id.toString(),
            customerName: project.customerName,
            projectAmount: project.projectAmount,
            services: project.services,
            updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            changes: {
              fields: changes,
              previousData: {
                customerName: originalProject.customerName,
                projectAmount: originalProject.projectAmount,
                services: originalProject.services,
                projectStatus: originalProject.projectStatus,
                comment: originalProject.comment
              },
              newData: {
                customerName: project.customerName,
                projectAmount: project.projectAmount,
                services: project.services,
                projectStatus: project.projectStatus,
                comment: project.comment
              }
            }
          },
          priority: 'medium',
          projectId: project._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProjectNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending project update notification:', notificationError);
      // Don't fail the project update if notification fails
    }

    res.status(200).json({
      success: true,
      data: project,
      message: "Project updated successfully",
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
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project",
    });
  }
};

/**
 * @desc    Update specific field of project (for inline editing)
 * @route   PATCH /api/projects/:id/field
 * @access  Private
 */
const updateProjectField = async (req, res) => {
  try {
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Field and value are required",
      });
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Prepare update data
    const updateData = {};
    updateData[field] = value;

    // Store original project data for comparison
    const originalProject = await Project.findById(req.params.id);

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Send notifications for project field updates
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('projects', 'i') },
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
          type: 'project_field_updated',
          title: 'Project Field Updated',
          body: `Project "${project.customerName}" ${field} has been updated to "${value}" by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            projectId: project._id.toString(),
            customerName: project.customerName,
            field: field,
            oldValue: originalProject[field],
            newValue: value,
            updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            changes: {
              field: field,
              previousValue: originalProject[field],
              newValue: value
            }
          },
          priority: 'medium',
          projectId: project._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProjectNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending project field update notification:', notificationError);
      // Don't fail the project field update if notification fails
    }

    res.status(200).json({
      success: true,
      data: project,
      message: "Project field updated successfully",
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

    console.error("Update project field error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project field",
    });
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Store project data before deletion for notification
    const projectData = {
      _id: project._id,
      customerName: project.customerName,
      projectAmount: project.projectAmount,
      services: project.services,
      projectStatus: project.projectStatus
    };

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    // Send notifications for project deletion
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployee.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('projects', 'i') },
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
          type: 'project_deleted',
          title: 'Project Deleted',
          body: `Project "${projectData.customerName}" has been deleted by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            projectId: projectData._id.toString(),
            customerName: projectData.customerName,
            projectAmount: projectData.projectAmount,
            services: projectData.services,
            deletedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            projectDetails: {
              customerName: projectData.customerName,
              projectAmount: projectData.projectAmount,
              services: projectData.services,
              projectStatus: projectData.projectStatus
            }
          },
          priority: 'high',
          projectId: projectData._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendProjectNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending project deletion notification:', notificationError);
      // Don't fail the project deletion if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting project",
    });
  }
};

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats
 * @access  Private
 */
const getProjectStats = async (req, res) => {
  try {
    // Status breakdown
    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: "$projectStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$projectAmount" },
        },
      },
    ]);

    // Service breakdown
    const serviceStats = await Project.aggregate([
      {
        $group: {
          _id: "$services",
          count: { $sum: 1 },
          totalAmount: { $sum: "$projectAmount" },
        },
      },
    ]);

    const totalProjects = await Project.countDocuments();
    const totalValue = await Project.aggregate([
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
        statusBreakdown: statusStats,
        serviceBreakdown: serviceStats,
        totalProjects,
        totalValue: totalValue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching project statistics",
    });
  }
};

/**
 * @desc    Add task to project
 * @route   POST /api/projects/:id/tasks
 * @access  Private
 */

/**
 * @desc    Update task status
 * @route   PATCH /api/projects/:id/tasks/:taskId
 * @access  Private
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const { id, taskId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.isCompleted = isCompleted;
    if (isCompleted) {
      task.completedDate = new Date();
    } else {
      task.completedDate = undefined;
    }

    await project.save(); // This will trigger pre-save middleware to update progress

    res.status(200).json({
      success: true,
      data: project,
      message: "Task status updated successfully",
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task status",
    });
  }
};

/**
 * @desc    Update project progress manually
 * @route   PATCH /api/projects/:id/progress
 * @access  Private
 */
const updateProjectProgress = async (req, res) => {
  try {
    const { totalTasks, completedTasks } = req.body;
    const { id } = req.params;

    if (totalTasks < 0 || completedTasks < 0 || completedTasks > totalTasks) {
      return res.status(400).json({
        success: false,
        message: "Invalid task counts",
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.totalTasks = totalTasks;
    project.completedTasks = completedTasks;
    await project.save(); // This will trigger pre-save middleware to update progress

    res.status(200).json({
      success: true,
      data: project,
      message: "Project progress updated successfully",
    });
  } catch (error) {
    console.error("Update project progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project progress",
    });
  }
};

/**
 * @desc    Sync project with its tasks (progress and assigned employees)
 * @route   POST /api/projects/:id/sync-tasks
 * @access  Private
 */
const syncProjectWithTasks = async (req, res) => {
  try {
    const { id } = req.params;

    // Use the static method from the Project model
    const result = await Project.syncProjectWithTasks(id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || "Failed to sync project with tasks",
      });
    }

    res.status(200).json({
      success: true,
      data: result.project,
      stats: result.stats,
      message: "Project synchronized with tasks successfully",
    });
  } catch (error) {
    console.error("Sync project with tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while synchronizing project with tasks",
    });
  }
};

module.exports = {
  createProject,
  createProjectFromProposal,
  getProjects,
  getProject,
  updateProject,
  updateProjectField,
  deleteProject,
  getProjectStats,
  updateTaskStatus,
  updateProjectProgress,
  syncProjectWithTasks,
};
