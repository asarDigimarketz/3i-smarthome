const express = require("express");
const router = express.Router();
const proposalRoutes = require("./proposal/proposalRoutes");
const projectRoutes = require("./project/projectRoutes");
const taskRoutes = require("./project/taskRoutes");
const customerRoutes = require("./customer/customerRoutes");
const employeeRoutes = require("./employeeManagement/employee");
const rolesRoutes = require("./rolesAndPermission/roles");
const settingsRoutes = require("./settings/settingsRoutes.js");
const authRoutes = require('./auth');
const userRoutes = require('./user');
const fcmRoutes = require('./fcm');
const notificationRoutes = require('./notification/notificationRoutes');

// Mount routes
router.use("/api/proposals", proposalRoutes);
router.use("/api/projects", projectRoutes);
router.use("/api/tasks", taskRoutes);
router.use("/api/customers", customerRoutes);
router.use("/api/employeeManagement", employeeRoutes);
router.use("/api/rolesAndPermission", rolesRoutes);
router.use("/api/settings", settingsRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/user', userRoutes);
router.use('/api/fcm', fcmRoutes);
router.use('/api/notifications', notificationRoutes);
module.exports = router;
