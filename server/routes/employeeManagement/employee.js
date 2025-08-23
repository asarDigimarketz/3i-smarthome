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
router.get("/", authMiddleware, getEmployees);

// Create new employee with file upload
router.post("/", authMiddleware, uploadFiles, createEmployee);

// Get employee by ID
router.get("/:employeeId", authMiddleware, getEmployeeById);

// Update employee by ID
router.put("/:employeeId", authMiddleware, uploadFiles, updateEmployee);

// Delete employee by ID
router.delete("/:employeeId", authMiddleware, deleteEmployee);

module.exports = router;
