const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      resolve();
      return;
    }

    // Construct full file path - fix the path resolution
    // The filePath comes as "/assets/images/logo/filename.png"
    // We need to resolve it from the server root directory
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), "public", filePath.replace(/^\//, ""));


    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist, resolve without error
        resolve();
      } else {
        fs.unlink(fullPath, (err) => {
          if (err) {
            // If error is not "file not found", reject
            console.error("Error deleting file:", fullPath, err);
            reject(err);
          } else {
            // Successfully deleted
            resolve();
          }
        });
      }
    });
  });
};

const saveFile = async (logoFile, oldLogoPath) => {
  try {
    // Delete old logo first
    if (oldLogoPath) {
      await deleteFile(oldLogoPath);
    }

    // Create filename
    const filename = `logo-${Date.now()}-${logoFile.originalname}`;

    // Use the specified path: D:\3i-smarthome\server\public\assets\images\logo
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "logo"
    );

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save new file
    const filePath = path.join(uploadDir, filename);
    fs.copyFileSync(logoFile.path, filePath);


    // Return the public URL path similar to taskRoutes.js pattern
    return `/assets/images/logo/${filename}`;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
};

// Utility function to clean up orphaned logo files
const cleanupOldLogos = async (currentLogoPath) => {
  try {
    const logoDir = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "logo"
    );

    if (!fs.existsSync(logoDir)) {
      return;
    }

    const files = fs.readdirSync(logoDir);
    const currentFileName = currentLogoPath
      ? path.basename(currentLogoPath)
      : null;

    for (const file of files) {
      // Skip the current logo file
      if (file === currentFileName) {
        continue;
      }

      // Only delete files that match the logo naming pattern
      if (
        file.startsWith("logo-") &&
        /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
      ) {
        const filePath = path.join(logoDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error cleaning up old logo file:", file, err);
        }
      }
    }
  } catch (error) {
    console.error("Error during logo cleanup:", error);
  }
};

module.exports = {
  deleteFile,
  saveFile,
  cleanupOldLogos,
};
