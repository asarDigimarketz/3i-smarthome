const mongoose = require("mongoose");
const crypto = require("crypto");
const { validatePassword } = require("../../utils/passwordValidation");

const UserEmployeeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (password) {
        const { isValid } = validatePassword(password);
        return isValid;
      },
      message:
        "Password must meet the following requirements:\n" +
        "- At least 8 characters long\n" +
        "- At least one uppercase letter\n" +
        "- At least one lowercase letter\n" +
        "- At least one number\n" +
        "- At least one special character (@$!%*?&)",
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  permissions: [
    {
      page: String,
      url: String,
      actions: {
        view: Boolean,
        add: Boolean,
        edit: Boolean,
        delete: Boolean,
      },
    },
  ],
  googleId: String,
  picture: String,
  locale: String,
});

UserEmployeeSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return resetToken;
};
const UserEmployee = mongoose.model("UserEmployee", UserEmployeeSchema);
module.exports = UserEmployee;
