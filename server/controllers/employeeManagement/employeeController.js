const multer = require("multer");
const path = require("path");
const fs = require("fs");
const employeeSchema = require("../../models/employeeManagement/employeeSchema");
const UserEmployeeSchema = require("../../models/employeeManagement/UserEmployeeSchema");
const roleSchema = require("../../models/rolesAndPermission/roleSchema");
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "employees",
      file.fieldname === "avatar" ? "avatars" : "documents"
    );
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Configure multer middleware
exports.uploadFiles = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "documents", maxCount: 10 }, // use documents, not attachments
]);

// Helper function to generate employee ID
async function generateEmployeeId(EmployeeModel, dateOfHiring) {
  const employees = await EmployeeModel.find().sort({ dateOfHiring: 1 });
  const nextNumber = employees.length + 1;

  const hiringDate = new Date(dateOfHiring);
  const datePrefix = hiringDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, "");

  return `EMP-${datePrefix}-${nextNumber.toString().padStart(4, "0")}`;
}

// Helper function to update employee IDs
async function updateEmployeeIds(EmployeeModel, employees) {
  try {
    const updateOperations = [];
    const existingIds = new Set();

    // Sort all employees by hiring date and _id to ensure consistent ordering
    const sortedEmployees = employees.sort((a, b) => {
      const dateA = new Date(a.dateOfHiring);
      const dateB = new Date(b.dateOfHiring);
      if (dateA - dateB === 0) {
        return a._id.toString().localeCompare(b._id.toString());
      }
      return dateA - dateB;
    });

    // Generate new IDs and check for duplicates
    for (let i = 0; i < sortedEmployees.length; i++) {
      const emp = sortedEmployees[i];
      const hiringDate = new Date(emp.dateOfHiring);
      const datePrefix = hiringDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .replace(/\//g, "");

      let sequentialNumber = i + 1;
      let newEmployeeId;

      do {
        newEmployeeId = `EMP-${datePrefix}-${sequentialNumber
          .toString()
          .padStart(4, "0")}`;
        sequentialNumber++;
      } while (existingIds.has(newEmployeeId));

      existingIds.add(newEmployeeId);

      if (emp.employeeId !== newEmployeeId) {
        updateOperations.push({
          updateOne: {
            filter: { _id: emp._id },
            update: { $set: { employeeId: newEmployeeId } },
            upsert: false,
          },
        });
      }
    }

    // Execute updates in batches
    if (updateOperations.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < updateOperations.length; i += batchSize) {
        const batch = updateOperations.slice(i, i + batchSize);
        await EmployeeModel.bulkWrite(batch, { ordered: false });
      }
    }
  } catch (error) {
    console.error("Error updating employee IDs:", error);
    throw error;
  }
}

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const Employee = employeeSchema;

    // Fetch all employees
    const employees = await Employee.find().sort({ dateOfHiring: 1, _id: 1 });

    try {
      // Update employee IDs
      await updateEmployeeIds(Employee, employees);
    } catch (error) {
      console.error("Error during ID update:", error);
      // Continue with existing IDs if update fails
    }

    // Fetch and return the final list of employees
    const updatedEmployees = await Employee.find().sort({
      dateOfHiring: 1,
      _id: 1,
    });

    res.status(200).json({
      success: true,
      employees: updatedEmployees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const Employee = employeeSchema;

    // Basic validation
    const requiredFields = [
      "role",
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "email",
      "mobileNo",
      "address",
      "dateOfHiring",
      "department",
      "status",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Parse role, department, and shift data
    const role =
      typeof req.body.role === "string"
        ? JSON.parse(req.body.role)
        : req.body.role;
    const department = req.body.department;

    const dateOfHiring = req.body.dateOfHiring;

    // Generate employee ID
    const employeeId = await generateEmployeeId(Employee, dateOfHiring);

    // Create employee object
    const employeeData = {
      employeeId,
      role,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      dateOfHiring,
      department,
      status: req.body.status,
      notes: req.body.notes,
      address: {
        addressLine:
          req.body["address[addressLine]"] || req.body.address?.addressLine,
        city: req.body["address[city]"] || req.body.address?.city,
        district: req.body["address[district]"] || req.body.address?.district,
        state: req.body["address[state]"] || req.body.address?.state,
        country: req.body["address[country]"] || req.body.address?.country,
        pincode: req.body["address[pincode]"] || req.body.address?.pincode,
      },
    };

    // Handle avatar upload
    if (req.files && req.files.avatar) {
      const avatar = req.files.avatar[0];
      employeeData.avatar = `${BACKEND_URL}/assets/images/employees/avatars/${avatar.filename}`;
    }

    // Handle documents upload (array of objects)
    if (req.files && req.files.documents) {
      employeeData.documents = req.files.documents.map((file) => ({
        url: `${BACKEND_URL}/assets/images/employees/documents/${file.filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
    }

    // Save to database
    const employee = new Employee(employeeData);
    await employee.save();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add employee",
      error: error.message,
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is missing",
    });
  }

  try {
    const Employee = employeeSchema;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is missing",
    });
  }

  try {
    const Employee = employeeSchema;
    const UserEmployee = UserEmployeeSchema;
    const Role = roleSchema;

    // Validate and parse JSON fields
    const roleData =
      typeof req.body.role === "string"
        ? JSON.parse(req.body.role)
        : req.body.role;
    let departmentData = req.body.department;
    // Only parse if it looks like an object/array, otherwise use as string
    if (
      typeof departmentData === "string" &&
      (departmentData.trim().startsWith("{") ||
        departmentData.trim().startsWith("["))
    ) {
      departmentData = JSON.parse(departmentData);
    }
    const statusData = req.body.status;

    if (!roleData || !departmentData || !statusData) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
      });
    }

    const employeeData = {
      role: roleData,
      department: departmentData,

      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      address: {
        addressLine:
          req.body["address[addressLine]"] || req.body.address?.addressLine,
        city: req.body["address[city]"] || req.body.address?.city,
        district: req.body["address[district]"] || req.body.address?.district,
        state: req.body["address[state]"] || req.body.address?.state,
        country: req.body["address[country]"] || req.body.address?.country,
        pincode: req.body["address[pincode]"] || req.body.address?.pincode,
      },
      dateOfHiring: req.body.dateOfHiring,
      status: statusData,
      notes: req.body.notes,
    };

    // Handle avatar upload
    if (req.files?.avatar) {
      const avatar = req.files.avatar[0];
      employeeData.avatar = `${BACKEND_URL}/assets/images/employees/avatars/${avatar.filename}`;
    } else if (req.body.existingAvatar) {
      employeeData.avatar = req.body.existingAvatar;
    }

    // Handle documents
    let baseDocuments = [];
    if (req.body.existingDocuments) {
      try {
        baseDocuments = JSON.parse(req.body.existingDocuments);
      } catch {
        baseDocuments = [];
      }
    }
    employeeData.documents = Array.isArray(baseDocuments)
      ? baseDocuments.map((doc) =>
          typeof doc === "object" ? doc : { url: doc }
        )
      : [];
    if (req.files && req.files.documents) {
      const newFiles = req.files.documents.map((file) => ({
        url: `${BACKEND_URL}/assets/images/employees/documents/${file.filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
      employeeData.documents.push(...newFiles);
    }
    // Remove deleted documents from disk
    if (req.body.removedDocuments) {
      try {
        const removed = JSON.parse(req.body.removedDocuments);
        for (const doc of removed) {
          const url = typeof doc === "object" ? doc.url : doc;
          if (url) {
            let relPath = url.replace(BACKEND_URL, "");
            if (!relPath.startsWith("/assets/images/employees/documents/")) {
              // If only filename is present, prepend the correct folder
              if (!relPath.startsWith("/")) relPath = "/" + relPath;
              relPath = "/assets/images/employees/documents" + relPath;
            }
            if (relPath.startsWith("/")) relPath = relPath.slice(1);
            const filePath = path.join(process.cwd(), "public", relPath);

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            } else {
              console.warn(
                "[Employee Remove Document] File not found:",
                filePath
              );
            }
          }
        }
      } catch (err) {
        console.error("Error removing documents:", err);
      }
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      employeeData,
      { new: true }
    );

    // Update user employee data (role and permissions)
    const updatedRole = await Role.findById(roleData._id);
    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await UserEmployee.findOneAndUpdate(
      { email: updatedEmployee.email },
      {
        role: updatedRole._id,
        permissions: updatedRole.permissions,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};
