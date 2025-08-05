const nodemailer = require("nodemailer");
const emailConfigurationSchema = require("../../../models/settings/emailConfiguration/emailConfigurationSchema");
const { getEmailConfig } = require("../../../utils/sendEmail");

// Get email configuration
exports.getEmailConfiguration = async (req, res) => {
  try {
    const EmailConfig = emailConfigurationSchema;
    const config = await EmailConfig.findOne();

    return res.json({
      success: true,
      emailConfig: config || {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update email configuration
exports.updateEmailConfiguration = async (req, res) => {
  try {
    const EmailConfig = emailConfigurationSchema;
    const body = req.body;

    // Validate required fields
    const requiredFields = [
      "smtpPort",
      "smtpUsername",
      "smtpPassword",
      "senderEmail",
      "smtpHost",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Update or create email configuration
    const config = await EmailConfig.findOneAndUpdate(
      {},
      {
        ...body,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      emailConfig: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Test email configuration with dynamic settings
exports.testEmailConfiguration = async (req, res) => {
  try {
    const { testEmail, message } = req.body;

    if (!testEmail || !testEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid test email address",
      });
    }

    // Get dynamic email configuration (database first, then environment variables)
    const emailConfig = await getEmailConfig();



    try {
      const transporter = nodemailer.createTransport(emailConfig);

      // Add specific error handling for Gmail
      if (emailConfig.host.includes("gmail")) {
        try {
          await transporter.verify();
        } catch (gmailError) {
          return res.status(401).json({
            success: false,
            message:
              "Gmail authentication failed. Please ensure you're using an App Password if 2FA is enabled.",
            details: `For Gmail: 
              1. Enable 2-Step Verification in your Google Account
              2. Generate an App Password (Google Account → Security → App Passwords)
              3. Use that 16-character App Password instead of your regular password`,
          });
        }
      }

      // Send test email
      const mailOptions = {
        from: emailConfig.from,
        to: testEmail,
        subject: "Test Email Configuration",
        text:
          message || "This is a test email to verify your email configuration.",
      };

      await transporter.sendMail(mailOptions);

      return res.json({
        success: true,
        message: "Test email sent successfully",
        configSource: emailConfig.host === process.env.SMTP_HOST ? "Environment Variables" : "Database Settings"
      });
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send test email",
        details: emailError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
