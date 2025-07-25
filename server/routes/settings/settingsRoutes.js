const express = require("express");
const router = express.Router();
const GeneralRoutes = require("./general/generalRoutes");
const EmailConfigurationRoutes = require("./emailConfiguration/emailConfiguration.route");
router.use("/general", GeneralRoutes);
router.use("/emailConfiguration", EmailConfigurationRoutes);

module.exports = router;
