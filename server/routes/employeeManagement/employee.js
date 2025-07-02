const express = require("express");
const router = express.Router();
const employeeController = require("../../controllers/employeeManagement/employeeController");

// Get all employees
router.get("/", employeeController.getEmployees);

// Create new employee with file upload
router.post(
  "/",
  employeeController.uploadFiles,
  employeeController.createEmployee
);

// Get employee by ID
router.get("/:employeeId", employeeController.getEmployeeById);

// Update employee by ID
router.put(
  "/:employeeId",
  employeeController.uploadFiles,
  employeeController.updateEmployee
);

module.exports = router;
