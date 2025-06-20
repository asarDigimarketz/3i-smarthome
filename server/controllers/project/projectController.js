const Project = require("../../models/project/Project");
const Proposal = require("../../models/proposal/Proposal");

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

    // Add file information if file was uploaded
    if (req.fileInfo) {
      projectData.attachment = {
        filename: req.fileInfo.filename,
        originalName: req.fileInfo.originalName,
        mimetype: req.fileInfo.mimetype,
        size: req.fileInfo.size,
        url: req.fileInfo.path,
      };
    }

    // If created from proposal, add proposal date
    if (proposalId) {
      const proposal = await Proposal.findById(proposalId);
      if (proposal) {
        projectData.proposalDate = proposal.date;
      }
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
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

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully from proposal",
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
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      status = "",
      service = "",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      status,
      service,
    };

    const projects = await Project.getProjectsWithFilters({}, options);

    // Get total count for pagination
    const total = await Project.getProjectsCount({
      search,
      status,
      service,
    });

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
    const project = await Project.findById(req.params.id).populate(
      "proposalId"
    );
    //   .populate('assignedEmployees', 'name email');

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

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

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

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

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
    const stats = await Project.aggregate([
      {
        $group: {
          _id: "$projectStatus",
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
        statusBreakdown: stats,
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
const addTaskToProject = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const newTask = {
      title,
      description,
      assignedTo,
      isCompleted: false,
    };

    project.tasks.push(newTask);
    await project.save(); // This will trigger pre-save middleware to update progress

    res.status(201).json({
      success: true,
      data: project,
      message: "Task added successfully",
    });
  } catch (error) {
    console.error("Add task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding task",
    });
  }
};

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

module.exports = {
  createProject,
  createProjectFromProposal,
  getProjects,
  getProject,
  updateProject,
  updateProjectField,
  deleteProject,
  getProjectStats,
  addTaskToProject,
  updateTaskStatus,
  updateProjectProgress,
};
