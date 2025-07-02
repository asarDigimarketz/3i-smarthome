const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Multer configuration for handling file uploads
 * Supports proposal attachment uploads with proper validation
 */

// Ensure uploads directory exists
const uploadsDir = path.join(
  __dirname,
  "../public/assets/images/proposal/project-attachments"
);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Storage configuration for Multer
 * Defines where and how to store uploaded files
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `proposal-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

/**
 * File filter to validate uploaded files
 * Only allows specific file types for proposal attachments
 */
const fileFilter = (req, file, cb) => {
  // Allowed file types based on client component requirements
  const allowedTypes = [
    "application/pdf", // PDF files
    "image/jpeg", // JPEG images
    "image/jpg", // JPG images
    "image/png", // PNG images
    "application/msword", // DOC files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
  ];

  // Allowed file extensions
  const allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png", ".doc", ".docx"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, JPEG, JPG, PNG, DOC, and DOCX files are allowed."
      ),
      false
    );
  }
};

/**
 * Main upload configuration
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 1, // Only one file per upload
  },
});

/**
 * Middleware for single file upload (proposal attachment)
 */
const uploadProposalAttachment = upload.single("attachment");

/**
 * Enhanced middleware wrapper with better error handling
 */
const handleProposalUpload = (req, res, next) => {
  uploadProposalAttachment(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      let errorMessage = "File upload error";

      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          errorMessage = "File size too large. Maximum size allowed is 10MB.";
          break;
        case "LIMIT_FILE_COUNT":
          errorMessage = "Too many files. Only one file is allowed.";
          break;
        case "LIMIT_UNEXPECTED_FILE":
          errorMessage =
            'Unexpected field name. Use "attachment" as field name.';
          break;
        default:
          errorMessage = err.message;
      }

      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    // If file was uploaded, add file info to request
    if (req.file) {
      req.fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };
    }

    next();
  });
};

/**
 * Utility function to delete uploaded file
 * Used when proposal is deleted or file is updated
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      resolve();
      return;
    }

    // Construct full file path
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(__dirname, "../public", filePath);

    fs.unlink(fullPath, (err) => {
      if (err && err.code !== "ENOENT") {
        // If error is not "file not found", reject
        reject(err);
      } else {
        // Successfully deleted or file didn't exist
        resolve();
      }
    });
  });
};

/**
 * Utility function to get file URL for frontend
 */
const getFileUrl = (filename) => {
  if (!filename) return null;
  return `/assets/images/proposal/project-attachments/${filename}`;
};

/**
 * Middleware to handle file updates
 * Deletes old file when new file is uploaded
 */
const handleFileUpdate = async (oldFilePath) => {
  try {
    if (oldFilePath) {
      await deleteFile(oldFilePath);
    }
  } catch (error) {
    console.error("Error deleting old file:", error);
    // Don't throw error, just log it as file cleanup is not critical
  }
};

module.exports = {
  upload,
  uploadProposalAttachment,
  handleProposalUpload,
  deleteFile,
  getFileUrl,
  handleFileUpdate,
};
