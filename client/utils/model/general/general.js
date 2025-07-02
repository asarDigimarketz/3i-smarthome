import mongoose from "mongoose";
const Schema = mongoose.Schema;
const GeneralSchema = new Schema(
  {
    generalDb: {
      type: String,
      default: "default-general",
      index: true,
    },
    preferenceId: {
      type: String,
      required: true,
      // Remove unique constraint from schema since we'll handle it in code
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
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
    mobileNo: {
      type: String,
      required: true,
    },
    landlineNo: {
      type: String,
      required: false,
    },
    emailId: {
      type: String,
      required: true,
    },
    doorNo: {
      type: String,
      required: true,
    },
    streetName: {
      type: String,
      required: true,
    },
    pincode: {
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
    logo: {
      type: String,
      required: false,
    },
    // Remove color field as it's now in separate model
  },
  { timestamps: true }
);

const General =
  mongoose.models.General || mongoose.model("General", GeneralSchema);
export default General;
