const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getTasksByProject,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../../controllers/project/taskController");
const authenticateToken = require("../../middleware/authMiddleware");
const fs = require("fs");
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../public/assets/images/tasks");
const beforeDir = path.join(uploadsDir, "before");
const afterDir = path.join(uploadsDir, "after");
const attachementsDir = path.join(uploadsDir, "attachements");

if (!fs.existsSync(beforeDir)) {
  fs.mkdirSync(beforeDir, { recursive: true });
}
if (!fs.existsSync(afterDir)) {
  fs.mkdirSync(afterDir, { recursive: true });
}
if (!fs.existsSync(attachementsDir)) {
  fs.mkdirSync(attachementsDir, { recursive: true });
}

// Configure multer for file uploads - Before Images

// Configure multer for file uploads - After Images

// const fileFilter = (req, file, cb) => {
//   // Allow only specific file types
//   const allowedTypes = [
//     "application/pdf",
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Invalid file type. Only PDF, JPEG, and PNG files are allowed."
//       ),
//       false
//     );
//   }
// };

// Create multer instances

// Combined middleware to handle both before and after attachments
const handleFileUploads = (req, res, next) => {
  // Use multer.fields to handle multiple field names
  const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        if (file.fieldname === "beforeAttachments") {
          cb(null, beforeDir);
        } else if (file.fieldname === "afterAttachments") {
          cb(null, afterDir);
        } else if (file.fieldname === "attachements") {
          cb(null, attachementsDir);
        } else {
          cb(new Error("Invalid field name"), false);
        }
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        let prefix = "";
        if (file.fieldname === "beforeAttachments") prefix = "before";
        else if (file.fieldname === "afterAttachments") prefix = "after";
        else if (file.fieldname === "attachements") prefix = "attch";
        cb(
          null,
          `task-${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`
        );
      },
    }),
    // limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    // fileFilter,
  });

  upload.fields([
    { name: "beforeAttachments" },
    { name: "afterAttachments" },
    { name: "attachements" }, // NEW: general attachments
  ])(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading files",
      });
    }

    // Process before attachments
    if (req.files && req.files.beforeAttachments) {
      req.beforeAttachments = req.files.beforeAttachments.map((file) => {
        return {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `${
            process.env.BACKEND_URL || "http://localhost:5000"
          }/assets/images/tasks/before/${file.filename}`,
        };
      });
    }

    // Process after attachments
    if (req.files && req.files.afterAttachments) {
      req.afterAttachments = req.files.afterAttachments.map((file) => {
        return {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `${
            process.env.BACKEND_URL || "http://localhost:5000"
          }/assets/images/tasks/after/${file.filename}`,
        };
      });
    }

    // Process general attachements
    if (req.files && req.files.attachements) {
      req.attachements = req.files.attachements.map((file) => {
        return {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `${
            process.env.BACKEND_URL || "http://localhost:5000"
          }/assets/images/tasks/attachements/${file.filename}`,
        };
      });
    }

    next();
  });
};

// Routes
router.get("/project/:projectId", authenticateToken, getTasksByProject);
router.get("/:id", authenticateToken, getTask);

// Handle file uploads with custom middleware
router.post(
  "/",
  authenticateToken,
  (req, res, next) => {
    // Check if it's a multipart request
    if (req.is("multipart/form-data")) {
      handleFileUploads(req, res, next);
    } else {
      // For JSON requests, just proceed
      next();
    }
  },
  createTask
);
router.put("/:id", authenticateToken, handleFileUploads, updateTask);

router.delete("/:id", authenticateToken, deleteTask);

module.exports = router;
