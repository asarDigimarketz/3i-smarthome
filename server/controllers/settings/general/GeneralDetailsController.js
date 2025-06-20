const multer = require("multer");
const path = require("path");
const General = require("../../../models/settings/general/general");
const { saveFile } = require("../../../utils/helpers/fileUpload");
const { DEFAULT_GENERAL_DATA } = require("../../../config/defaultGeneralData");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const filename = `logo-${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Get General details
exports.getGeneralDetails = async (req, res) => {
  try {
    const generalData = await General.findOne();
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
      const generalData = await General.create(defaultGeneralData);
    }
    return res.json({ success: true, generalData: generalData });
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
      const { ...cleanUpdateData } = updateData;
      const logoFile = req.file;

      const GeneralModel = General;

      // Handle logo update
      if (logoFile) {
        const oldGeneral = await GeneralModel.findOne();
        const oldLogoPath = oldGeneral?.logo;

        // Save new logo and get its path
        const logoPath = await saveFile(logoFile.path, oldLogoPath);

        cleanUpdateData.logo = logoPath;
      }

      // Update General details
      const updatedGeneral = await GeneralModel.findOneAndUpdate(
        {},
        cleanUpdateData,
        { new: true, upsert: true }
      );

      return res.json({
        success: true,
        message: "General details updated successfully",
        generalData: updatedGeneral,
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
