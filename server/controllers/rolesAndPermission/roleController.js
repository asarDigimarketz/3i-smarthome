const roleSchema = require("../../models/rolesAndPermission/roleSchema");
const UserEmployeeSchema = require("../../models/employeeManagement/UserEmployeeSchema");
const EmployeeSchema = require("../../models/employeeManagement/employeeSchema");

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const RoleModel = roleSchema;
    const { role, permissions } = req.body;

    if (!role || role.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    // Check if role already exists
    const existingRole = await RoleModel.findOne({ role: role.trim() });
    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role already exists",
      });
    }

    const newRole = new RoleModel({
      role: role.trim(),
      permissions,
    });

    await newRole.save();

    res.status(201).json({
      success: true,
      role: newRole,
      message: "Role added successfully",
    });
  } catch (error) {
    console.error("Error adding role:", error);
    const errorMessage =
      error.code === 11000
        ? "Role already exists"
        : error.message || "Error adding role";
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: errorMessage,
    });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const RoleModel = roleSchema;

    const roles = await RoleModel.find();
    res.status(200).json({ success: true, roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update a role and associated user permissions
exports.updateRole = async (req, res) => {
  try {
    const RoleModel = roleSchema;
    const UserEmployee = UserEmployeeSchema;

    const { id, role, permissions } = req.body;

    const updatedRole = await RoleModel.findByIdAndUpdate(
      id,
      { role, permissions },
      { new: true }
    );

    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Update all UserEmployee documents with this role
    await UserEmployee.updateMany(
      { role: id },
      { $set: { permissions: permissions } }
    );

    res.status(200).json({
      success: true,
      role: updatedRole,
      message: "Role and associated user permissions updated successfully",
    });
  } catch (error) {
    console.error("Error updating role and user permissions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a role and associated records
exports.deleteRole = async (req, res) => {
  try {
    const RoleModel = roleSchema;
    const UserEmployee = UserEmployeeSchema;
    const Employee = EmployeeSchema;

    const { id } = req.body;

    const deletedRole = await RoleModel.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Delete associated records
    const userDeleteResult = await UserEmployee.deleteMany({ role: id });
    const employeeDeleteResult = await Employee.deleteMany({ "role._id": id });

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
      deletedUsers: userDeleteResult.deletedCount,
      deletedEmployees: employeeDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting role and associated employees:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
