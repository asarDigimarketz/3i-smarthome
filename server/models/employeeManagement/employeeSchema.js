const mongoose = require("mongoose");
const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: {
        _id: mongoose.Schema.Types.ObjectId,
        role: String,
        createdAt: Date,
      },
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    address: {
      addressLine: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    dateOfHiring: {
      type: Date,
      required: true,
    },
    department: {
      type: {
        name: String,
        createdAt: Date,
      },
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
    },
    avatar: {
      type: String,
    },
    documents: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure employeeId is unique
EmployeeSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("employeeId")) {
      const Employee = this.constructor;
      const existingEmployee = await Employee.findOne({
        employeeId: this.employeeId,
        _id: { $ne: this._id },
      });

      if (existingEmployee) {
        throw new Error("Employee ID already exists");
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});
const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
