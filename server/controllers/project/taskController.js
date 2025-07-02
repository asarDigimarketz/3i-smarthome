const Task = require("../../models/project/Task");
const Project = require("../../models/project/Project");

/**
 * Task Controller
 * Handles all CRUD operations for tasks
 */

/**
 * @desc    Get all tasks for a project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private
 */
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate project ID
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Transform the tasks to include the full name
    const transformedTasks = tasks.map((task) => {
      const taskObj = task.toObject();
      if (
        taskObj.assignedTo &&
        taskObj.assignedTo.firstName &&
        taskObj.assignedTo.lastName
      ) {
        taskObj.assignedTo.name = `${taskObj.assignedTo.firstName} ${taskObj.assignedTo.lastName}`;
      }
      return taskObj;
    });

    res.status(200).json({
      success: true,
      count: transformedTasks.length,
      data: transformedTasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
};

/**
 * @desc    Get a single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Transform the task to include the full name
    const taskObj = task.toObject();
    if (
      taskObj.assignedTo &&
      taskObj.assignedTo.firstName &&
      taskObj.assignedTo.lastName
    ) {
      taskObj.assignedTo.name = `${taskObj.assignedTo.firstName} ${taskObj.assignedTo.lastName}`;
    }

    res.status(200).json({
      success: true,
      data: taskObj,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
    });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const {
      projectId,
      title,
      comment,
      startDate,
      endDate,
      status = "new",
      assignedTo,
    } = req.body;

    // Validate required fields
    if (!projectId || !title || !startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (projectId, title, startDate)",
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Create task data
    const taskData = {
      projectId,
      title,
      comment: comment || "",
      startDate: new Date(startDate),
      status,
    };

    // Only add assignedTo if it's not empty
    if (assignedTo && assignedTo.trim() !== "") {
      taskData.assignedTo = assignedTo;
    }

    // Add end date if provided and not empty
    if (endDate && endDate.trim() !== "") {
      taskData.endDate = new Date(endDate);
    }

    // Add file attachments if provided (handled by middleware)
    if (req.beforeAttachments && req.beforeAttachments.length > 0) {
      taskData.beforeAttachments = req.beforeAttachments;
    }

    if (req.afterAttachments && req.afterAttachments.length > 0) {
      taskData.afterAttachments = req.afterAttachments;
    }

    // Create the task
    const task = await Task.create(taskData);

    // Update project task counts
    await updateProjectTaskCounts(projectId);

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Create task error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const { title, comment, startDate, endDate, status, assignedTo } = req.body;

    // Find task
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Update task data
    const taskData = {};

    if (title) taskData.title = title;
    if (comment !== undefined) taskData.comment = comment;
    if (startDate) taskData.startDate = new Date(startDate);
    if (endDate) taskData.endDate = new Date(endDate);
    if (status) taskData.status = status;
    if (assignedTo) taskData.assignedTo = assignedTo;

    // Add file attachments if provided (handled by middleware)
    if (req.beforeAttachments && req.beforeAttachments.length > 0) {
      taskData.beforeAttachments = [
        ...(task.beforeAttachments || []),
        ...req.beforeAttachments,
      ];
    }

    if (req.afterAttachments && req.afterAttachments.length > 0) {
      taskData.afterAttachments = [
        ...(task.afterAttachments || []),
        ...req.afterAttachments,
      ];
    }

    // Update the task
    task = await Task.findByIdAndUpdate(req.params.id, taskData, {
      new: true,
      runValidators: true,
    });

    // If status changed, update project task counts
    if (status) {
      await updateProjectTaskCounts(task.projectId);
    }

    res.status(200).json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Update task error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Store project ID before deleting task
    const projectId = task.projectId;

    // Delete the task
    await task.deleteOne();

    // Update project task counts
    await updateProjectTaskCounts(projectId);

    res.status(200).json({
      success: true,
      data: {},
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
};

/**
 * Helper function to update project task counts, progress, and assigned employees
 */
const updateProjectTaskCounts = async (projectId) => {
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
    await Project.findByIdAndUpdate(projectId, {
      totalTasks,
      completedTasks,
      progress: `${progressPercentage}%`,
      assignedEmployees: uniqueAssignedEmployees,
    });

    console.log(
      `Project ${projectId} updated: ${completedTasks}/${totalTasks} tasks completed (${progressPercentage}%), ${uniqueAssignedEmployees.length} unique employees assigned`
    );

    return true;
  } catch (error) {
    console.error("Update project task counts error:", error);
    return false;
  }
};

module.exports = {
  getTasksByProject,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
