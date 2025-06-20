const express = require("express");
const router = express.Router();
const proposalRoutes = require("./proposal/proposalRoutes");
const projectRoutes = require("./project/projectRoutes");
const employeeRoutes = require("./employeeManagement/employee");
const rolesRoutes = require("./rolesAndPermission/roles");
const settingsRoutes = require("./settings/settingsRoutes.js");
// Mount routes
router.use("/api/proposals", proposalRoutes);
router.use("/api/projects", projectRoutes);
router.use("/api/employeeManagement", employeeRoutes);
router.use("/api/rolesAndPermission", rolesRoutes);
router.use("/api/settings", settingsRoutes);
module.exports = router;
