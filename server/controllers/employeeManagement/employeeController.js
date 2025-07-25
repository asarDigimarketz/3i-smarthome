const multer = require("multer");
const path = require("path");
const fs = require("fs");
const employeeSchema = require("../../models/employeeManagement/employeeSchema");
const UserEmployeeSchema = require("../../models/employeeManagement/UserEmployeeSchema");
const roleSchema = require("../../models/rolesAndPermission/roleSchema");
const FCMToken = require("../../models/fcmToken");
const User = require("../../models/user");
const { createEmployeeNotification } = require("../../services/notificationService");
const mongoose = require("mongoose");
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Helper function to convert all values to strings for FCM
function convertToFCMData(data) {
  const fcmData = {};
  for (const [key, value] of Object.entries(data)) {
    fcmData[key] = String(value);
  }
  return fcmData;
}

// Helper function to get admin users
async function getAllAdminUsers() {
  try {
    const adminUsers = await User.find({
      $or: [
        { isAdmin: true },
        { role: { $in: ['admin', 'hotel admin', 'super admin'] } }
      ]
    });
    return adminUsers.map(user => user._id);
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
}

// Helper function to send FCM notifications for employees
async function sendEmployeeNotification(userIds, notification) {
  try {
    if (!userIds || userIds.length === 0) {
      console.log('No users to send employee notification to');
      return;
    }

    console.log('User IDs for employee notification:', userIds);

    // Save notifications to database first
    try {
      const savedNotifications = await createEmployeeNotification({
        type: notification.type || 'employee',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'medium',
        employeeId: notification.employeeId,
        triggeredBy: notification.triggeredBy,
        triggeredByModel: notification.triggeredByModel
      });
      console.log(`Saved ${savedNotifications.length} employee notifications to database`);
    } catch (dbError) {
      console.error('Error saving employee notifications to database:', dbError);
      // Continue with FCM sending even if database save fails
    }

    // Get FCM tokens for the users
    const tokens = await FCMToken.find({
      userId: { $in: userIds },
      isActive: true,
    });

    if (tokens.length === 0) {
      console.log(`No active FCM tokens found for User IDs: ${userIds.join(', ')}`);
      return;
    }

    const tokenList = tokens.map(t => t.token);
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually
    for (const token of tokenList) {
      try {
        // Convert all data values to strings for FCM compatibility
        const fcmData = convertToFCMData({
          type: notification.type || 'employee',
          employeeId: notification.employeeId || '',
          ...notification.data,
        });

        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: fcmData,
          token: token,
        };

        // Get Firebase Admin instance
        const admin = require('firebase-admin');
        await admin.messaging().send(message);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to token ${token}:`, error);
        failureCount++;
        
        // Remove failed token
        await FCMToken.deleteOne({ token });
      }
    }

    console.log(`Employee notification sent: ${successCount} successful, ${failureCount} failed`);

    if (failureCount > 0) {
      console.log(`Removed ${failureCount} failed FCM tokens`);
    }

    return {
      success: true,
      sent: successCount,
      failed: failureCount
    };
  } catch (error) {
    console.error('Error sending employee FCM notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

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

    // Extract query parameters for search and pagination
    const {
      page = 1,
      limit = 10,
      search = "",
      department = "",
      status = "",
      sortBy = "dateOfHiring",
      sortOrder = "desc",
    } = req.query;

    // Build search query
    let query = {};

    // Add search functionality for multiple fields
    if (search && search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNo: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { "address.addressLine": { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.district": { $regex: search, $options: "i" } },
        { "address.state": { $regex: search, $options: "i" } },
        { "address.country": { $regex: search, $options: "i" } },
      ];
    }

    // Add department filter
    if (department && department.trim()) {
      query.department = { $regex: department, $options: "i" };
    }

    // Add status filter
    if (status && status.trim()) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // If no search/filter criteria, update employee IDs first
    if (!search && !department && !status) {
      try {
        const allEmployees = await Employee.find().sort({ dateOfHiring: 1, _id: 1 });
        await updateEmployeeIds(Employee, allEmployees);
    } catch (error) {
      console.error("Error during ID update:", error);
      // Continue with existing IDs if update fails
    }
    }

    // Fetch employees with pagination and search
    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalEmployees = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalEmployees / limitNum);

    res.status(200).json({
      success: true,
      employees: employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEmployees,
        limit: limitNum,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
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

    // Send notifications to users with employee management permissions
    try {
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployeeSchema.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('employees', 'i') },
            'actions.view': true
          }
        }
      });

      const employeeUserIds = employeesWithPermission.map(emp => emp._id);
      const allUserIds = [...adminUserIds, ...employeeUserIds];
      const recipientUserIds = allUserIds.filter(userId => 
        userId.toString() !== (req.user ? req.user.id.toString() : '')
      );

      if (recipientUserIds.length > 0) {
        const notification = {
          type: 'employee_created',
          title: 'New Employee Added',
          body: `A new employee "${req.body.firstName} ${req.body.lastName}" has been added by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            employeeId: employee._id.toString(),
            employeeName: `${req.body.firstName} ${req.body.lastName}`,
            email: req.body.email,
            department: department,
            role: role.role,
            createdBy: req.user ? req.user.name || req.user.email : 'Unknown',
            employeeDetails: {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              mobileNo: req.body.mobileNo,
              department: department,
              role: role.role,
              status: req.body.status
            }
          },
          priority: 'medium',
          employeeId: employee._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendEmployeeNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending employee notification:', notificationError);
      // Don't fail the employee creation if notification fails
    }

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

    // Store original employee data for comparison
    const originalEmployee = await Employee.findOne({ employeeId });

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

    // Send notifications for employee updates
    try {
      // Determine what was changed
      const changes = [];
      if (employeeData.firstName && employeeData.firstName !== originalEmployee.firstName) changes.push('first name');
      if (employeeData.lastName && employeeData.lastName !== originalEmployee.lastName) changes.push('last name');
      if (employeeData.email && employeeData.email !== originalEmployee.email) changes.push('email');
      if (employeeData.mobileNo && employeeData.mobileNo !== originalEmployee.mobileNo) changes.push('mobile number');
      if (employeeData.department && JSON.stringify(employeeData.department) !== JSON.stringify(originalEmployee.department)) changes.push('department');
      if (employeeData.status && employeeData.status !== originalEmployee.status) changes.push('status');
      if (roleData.role && roleData.role !== originalEmployee.role.role) changes.push('role');
      
      const changesText = changes.length > 0 ? changes.join(', ') : 'details';
      
      // Get users with permissions
      const adminUserIds = await getAllAdminUsers();
      const employeesWithPermission = await UserEmployeeSchema.find({
        'permissions': {
          $elemMatch: {
            'page': { $regex: new RegExp('employees', 'i') },
            'actions.view': true
          }
        }
      });

      const employeeUserIds = employeesWithPermission.map(emp => emp._id);
      const allUserIds = [...adminUserIds, ...employeeUserIds];
      const recipientUserIds = allUserIds.filter(userId => 
        userId.toString() !== (req.user ? req.user.id.toString() : '')
      );

      if (recipientUserIds.length > 0) {
        const notification = {
          type: 'employee_updated',
          title: 'Employee Updated',
          body: `Employee "${updatedEmployee.firstName} ${updatedEmployee.lastName}" ${changesText} has been updated by ${req.user ? req.user.name || req.user.email : 'Unknown'}`,
          data: {
            employeeId: updatedEmployee._id.toString(),
            employeeName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
            email: updatedEmployee.email,
            department: updatedEmployee.department,
            role: updatedEmployee.role.role,
            updatedBy: req.user ? req.user.name || req.user.email : 'Unknown',
            changes: {
              fields: changes,
              previousData: {
                firstName: originalEmployee.firstName,
                lastName: originalEmployee.lastName,
                email: originalEmployee.email,
                mobileNo: originalEmployee.mobileNo,
                department: originalEmployee.department,
                status: originalEmployee.status,
                role: originalEmployee.role.role
              },
              newData: {
                firstName: updatedEmployee.firstName,
                lastName: updatedEmployee.lastName,
                email: updatedEmployee.email,
                mobileNo: updatedEmployee.mobileNo,
                department: updatedEmployee.department,
                status: updatedEmployee.status,
                role: updatedEmployee.role.role
              }
            }
          },
          priority: 'medium',
          employeeId: updatedEmployee._id.toString(),
          triggeredBy: req.user ? req.user.id : null,
          triggeredByModel: req.user && req.user.isAdmin ? 'User' : 'UserEmployee'
        };

        await sendEmployeeNotification(recipientUserIds, notification);
      }
    } catch (notificationError) {
      console.error('Error sending employee update notification:', notificationError);
      // Don't fail the employee update if notification fails
    }

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
