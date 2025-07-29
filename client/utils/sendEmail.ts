import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Get email configuration with fallback to environment variables
async function getEmailConfig() {
  try {
    // First, try to get configuration from database via API
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/settings/emailConfiguration`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const dbConfig = data.emailConfig;
      
      if (dbConfig && dbConfig.smtpHost && dbConfig.smtpUsername && dbConfig.smtpPassword) {
        console.log('📧 Using database email configuration');
        return {
          host: dbConfig.smtpHost,
          port: parseInt(dbConfig.smtpPort) || 587,
          auth: {
            user: dbConfig.smtpUsername,
            pass: dbConfig.smtpPassword,
          },
          from: dbConfig.senderEmail,
          secure: parseInt(dbConfig.smtpPort) === 465,
          tls: {
            rejectUnauthorized: false,
            ciphers: "SSLv3",
          },
          debug: false,
          logger: false,
        };
      }
    }
    
    // Fallback to environment variables
    console.log('📧 Using environment variables for email configuration');
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      from: process.env.SMTP_FROM_EMAIL,
      secure: Number(process.env.SMTP_PORT) === 465,
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
      debug: false,
      logger: false,
    };
  } catch (error) {
    console.error('❌ Error getting email configuration:', error);
    // Final fallback to environment variables
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      from: process.env.SMTP_FROM_EMAIL,
      secure: Number(process.env.SMTP_PORT) === 465,
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
      debug: false,
      logger: false,
    };
  }
}

export const sendEmail = async (
  userEmail: string,
  subject: string,
  message: string
) => {
  try {
    // Get dynamic email configuration
    const emailConfig = await getEmailConfig();
    
    // Validate required configuration
    if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error('Email configuration is incomplete. Please check SMTP settings.');
    }

    const transporter = nodemailer.createTransport(emailConfig);

    const mailOptions = {
      from: emailConfig.from,
      to: userEmail,
      subject,
      html: message,
    };

    console.log('📧 Sending email to:', userEmail);
    console.log('📧 Using SMTP host:', emailConfig.host);
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email send error:', error);
    return NextResponse.json(
      {
        message: "Something went wrong: " + error,
      },
      {
        status: 500,
      }
    );
  }
};

