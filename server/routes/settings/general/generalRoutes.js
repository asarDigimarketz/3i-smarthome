const express = require("express");
const router = express.Router();
const {
  getGeneralDetails,
  updateGeneralDetails,
} = require("../../../controllers/settings/general/GeneralDetailsController");

// Get General details
router.get("/", getGeneralDetails);

// Update General details
router.put("/", updateGeneralDetails);

module.exports = router;
