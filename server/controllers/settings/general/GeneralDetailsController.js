const multer = require("multer");
const path = require("path");
const General = require("../../../models/settings/general/general");
const {
  saveFile,
  deleteFile,
  cleanupOldLogos,
} = require("../../../utils/helpers/fileUpload");
const { DEFAULT_GENERAL_DATA } = require("../../../config/defaultGeneralData");
const fs = require("fs");

// Ensure logo directory exists
const logoDir = path.join(process.cwd(), "public", "assets", "images", "logo");
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const filename = `logo-${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Get General details
exports.getGeneralDetails = async (req, res) => {
  try {
    let generalData = await General.findOne();
    if (!generalData) {
      const preferenceId = "ISH20240002";
      const generalDb = "default-general";
      const emailId = process.env.ADMINEMAIL;
      const defaultGeneralData = {
        ...DEFAULT_GENERAL_DATA,
        preferenceId,
        generalDb,
        emailId,
      };
      generalData = await General.create(defaultGeneralData);
    }

    // Generate full URL for logo if it exists
    let logoUrl = null;
    if (generalData.logo) {
      const baseUrl =
        process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
      logoUrl = `${baseUrl}${generalData.logo}`;
    }

    return res.json({
      success: true,
      generalData: {
        ...generalData.toObject(),
        logo: logoUrl,
      },
    });
  } catch (err) {
    console.error("Error fetching general data:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching general details",
      error: err.message,
    });
  }
};

// Update General details
exports.updateGeneralDetails = [
  upload.single("logo"),
  async (req, res) => {
    try {
      const updateData = req.body;
      const logoFile = req.file;

      // Remove MongoDB specific fields and unnecessary fields
      const {
        _id,
        createdAt,
        updatedAt,
        __v,
        logoUrl,
        newLogo,
        ...cleanUpdateData
      } = updateData;

      const GeneralModel = General;

      // Handle logo update only if file was uploaded
      if (logoFile) {
        // Get old general data to delete old logo if exists
        const oldGeneral = await GeneralModel.findOne();
        if (oldGeneral && oldGeneral.logo) {
          console.log("Deleting old logo:", oldGeneral.logo);
          try {
            await deleteFile(oldGeneral.logo);
            console.log("Old logo deleted successfully");
          } catch (deleteError) {
            console.error("Error deleting old logo file:", deleteError);
            // Don't throw error here, just log it as the upload should continue
          }
        }

        // Set new logo path
        cleanUpdateData.logo = `/assets/images/logo/${logoFile.filename}`;
        console.log("New logo will be saved as:", cleanUpdateData.logo);
      }

      // Update General details
      const updatedGeneral = await GeneralModel.findOneAndUpdate(
        {},
        cleanUpdateData,
        { new: true, upsert: true }
      );

      // Clean up any orphaned logo files (optional, but good for maintenance)
      try {
        await cleanupOldLogos(updatedGeneral.logo);
      } catch (cleanupError) {
        console.error("Error during logo cleanup:", cleanupError);
        // Don't fail the request if cleanup fails
      }

      // Generate full URL for logo
      let responseLogoUrl = null;
      if (updatedGeneral.logo) {
        const baseUrl =
          process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
        responseLogoUrl = `${baseUrl}${updatedGeneral.logo}`;
      }

      return res.json({
        success: true,
        message: "General details updated successfully",
        generalData: {
          ...updatedGeneral.toObject(),
          logo: updatedGeneral.logo,
        },
      });
    } catch (err) {
      console.error("Error updating general data:", err);
      return res.status(500).json({
        success: false,
        message: "Error updating general details",
        error: err.message,
      });
    }
  },
];

// Manual cleanup endpoint for old logo files
exports.cleanupOldLogos = async (req, res) => {
  try {
    const currentGeneral = await General.findOne();
    const currentLogoPath = currentGeneral ? currentGeneral.logo : null;

    await cleanupOldLogos(currentLogoPath);

    return res.json({
      success: true,
      message: "Old logo files cleaned up successfully",
    });
  } catch (err) {
    console.error("Error cleaning up old logos:", err);
    return res.status(500).json({
      success: false,
      message: "Error cleaning up old logo files",
      error: err.message,
    });
  }
};
