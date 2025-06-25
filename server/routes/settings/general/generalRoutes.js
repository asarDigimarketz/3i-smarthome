const express = require("express");
const router = express.Router();
const {
  getGeneralDetails,
  updateGeneralDetails,
  cleanupOldLogos,
} = require("../../../controllers/settings/general/GeneralDetailsController");

// Get General details
router.get("/", getGeneralDetails);

// Update General details
router.put("/", updateGeneralDetails);

// Cleanup old logo files (manual cleanup endpoint)
router.post("/cleanup-logos", cleanupOldLogos);

module.exports = router;
