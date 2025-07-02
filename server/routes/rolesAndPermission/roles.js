const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/rolesAndPermission/roleController");

// Create a new role
router.post("/", roleController.createRole);

// Get all roles
router.get("/", roleController.getRoles);

// Update a role and associated user permissions
router.put("/", roleController.updateRole);

// Delete a role and associated records
router.delete("/", roleController.deleteRole);

module.exports = router;
