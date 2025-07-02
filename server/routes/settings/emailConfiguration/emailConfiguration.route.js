const express = require("express");
const router = express.Router();
const {
  getEmailConfiguration,
  updateEmailConfiguration,
  testEmailConfiguration,
} = require("../../../controllers/settings/emailConfiguration/emailConfigurationController");

// Get email configuration
router.get("/", getEmailConfiguration);

// Update email configuration
router.post("/", updateEmailConfiguration);

// Test email configuration
router.put("/", testEmailConfiguration);

module.exports = router;
