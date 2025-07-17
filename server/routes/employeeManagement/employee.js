const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadFiles,
} = require("../../controllers/employeeManagement/employeeController");
const authMiddleware = require("../../middleware/authMiddleware");

// Get all employees
router.get("/", getEmployees);

// Create new employee with file upload
router.post(
  "/",
  uploadFiles,
  createEmployee
);

// Get employee by ID
router.get("/:employeeId", getEmployeeById);

// Update employee by ID
router.put(
  "/:employeeId",
  uploadFiles,
  updateEmployee
);

module.exports = router;
