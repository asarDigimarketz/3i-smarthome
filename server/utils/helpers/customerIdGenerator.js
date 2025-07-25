const mongoose = require("mongoose");

/**
 * Generates or retrieves a unique customer ID based on email or mobile number
 * @param {Object} params - Customer identification parameters
 * @param {string} params.email - Customer's email address
 * @param {string} params.mobileNo - Customer's mobile number
 * @param {string} params.previousEmail - Previous email if updating
 * @param {string} params.previousMobile - Previous mobile if updating
 * @param {boolean} [params.updateProjects=false] - Whether to update project records
 * @returns {Promise<string>} The customer ID
 */
module.exports = async function generateCustomerId({
  email,
  mobileNo,
  previousEmail,
  previousMobile,
  updateProjects = false,
}) {
  try {
    // Use dynamic model references to avoid circular dependency
    const Project = mongoose.model("Project");
    const Customer = mongoose.model("Customer");

    const query = { $or: [] };

    // Build query conditions
    if (email) query.$or.push({ email: { $eq: email } });
    if (mobileNo) query.$or.push({ contactNumber: { $eq: mobileNo } });
    if (previousEmail) query.$or.push({ email: { $eq: previousEmail } });
    if (previousMobile)
      query.$or.push({ contactNumber: { $eq: previousMobile } });

    // First check if customer already exists in Customer collection
    let existingCustomer = null;
    if (query.$or.length > 0) {
      existingCustomer = await Customer.findOne({
        $or: query.$or,
        customerId: { $exists: true },
      }).sort({ createdAt: 1 });
    }

    if (existingCustomer?.customerId) {
      // Only update project records if explicitly requested
      if (
        updateProjects &&
        (email !== existingCustomer.email ||
          mobileNo !== existingCustomer.contactNumber)
      ) {
        await Project.updateMany(
          { customerId: existingCustomer.customerId },
          {
            $set: {
              email: email || existingCustomer.email,
              contactNumber: mobileNo || existingCustomer.contactNumber,
            },
          }
        );
      }
      return existingCustomer.customerId;
    }

    // Check if customer exists in Project collection (legacy data)
    let existingProject = null;
    if (query.$or.length > 0) {
      existingProject = await Project.findOne({
        $or: query.$or,
        customerId: { $exists: true },
      }).sort({ createdAt: 1 });
    }

    if (existingProject?.customerId) {
      // Only update project records if explicitly requested
      if (
        updateProjects &&
        (email !== existingProject.email ||
          mobileNo !== existingProject.contactNumber)
      ) {
        await Project.updateMany(
          { customerId: existingProject.customerId },
          {
            $set: {
              email: email || existingProject.email,
              contactNumber: mobileNo || existingProject.contactNumber,
            },
          }
        );
      }
      return existingProject.customerId;
    }

    // Generate new unique ID with better uniqueness
    let customerId;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

      // Add random suffix for better uniqueness
      const randomSuffix = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");

      const timeStamp = `${day}${hours}${minutes}${seconds}${milliseconds.slice(
        0,
        2
      )}${randomSuffix}`;
      customerId = `C${year}${month}${timeStamp}`;

      // Check if this ID already exists
      const existingId = await Customer.findOne({ customerId });
      if (!existingId) {
        break;
      }

      attempts++;
      // Add small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1));
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error(
        "Unable to generate unique customer ID after multiple attempts"
      );
    }

    return customerId;
  } catch (error) {
    console.error("Error generating customer ID:", error);
    throw new Error("Failed to generate customer ID");
  }
};
