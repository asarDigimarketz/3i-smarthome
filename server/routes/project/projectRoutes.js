const express = require("express");
const multer = require("multer");
const path = require("path");
const {
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
} = require("../../controllers/project/projectController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/images/project/attachments/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "project-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX files are allowed."
      ),
      false
    );
  }
};

// Change multer to accept multiple files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: fileFilter,
});

// File upload middleware for multiple attachments
const handleFileUpload = (req, res, next) => {
  upload.array("attachments", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 10MB per file.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "File upload error: " + err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Add files info to request if files were uploaded
    if (req.files && req.files.length > 0) {
      req.filesInfo = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      }));
    }

    next();
  });
};

/**
 * Project Routes
 * Based on AddProject.jsx form fields and requirements
 */

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get("/stats", getProjectStats);

// @route   POST /api/projects/from-proposal/:proposalId
// @desc    Create new project from proposal
// @access  Private
router.post("/from-proposal/:proposalId", createProjectFromProposal);

// @route   GET /api/projects
// @desc    Get all projects with filtering and pagination
// @access  Private
router.get("/", getProjects);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get("/:id", getProject);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post("/", handleFileUpload, createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put("/:id", handleFileUpload, updateProject);

// @route   PATCH /api/projects/:id/field
// @desc    Update specific field of project
// @access  Private
router.patch("/:id/field", updateProjectField);

// @route   PATCH /api/projects/:id/tasks/:taskId
// @desc    Update task status
// @access  Private
router.patch("/:id/tasks/:taskId", updateTaskStatus);

// @route   PATCH /api/projects/:id/progress
// @desc    Update project progress manually
// @access  Private
router.patch("/:id/progress", updateProjectProgress);

// @route   POST /api/projects/:id/sync-tasks
// @desc    Sync project with its tasks (progress and assigned employees)
// @access  Private
router.post("/:id/sync-tasks", syncProjectWithTasks);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete("/:id", deleteProject);

module.exports = router;
