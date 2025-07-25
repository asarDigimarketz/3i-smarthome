const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserEmployee = require('../models/employeeManagement/UserEmployeeSchema');
const User = require('../models/user'); // Add this: your admin user model
const authenticateToken = require('../middleware/authMiddleware');
const Role = require('../models/rolesAndPermission/roleSchema');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/mobile-login
router.post('/mobile-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Try to find user in UserEmployee (employees)
    let user = await UserEmployee.findOne({ email }).populate('role');
    let userType = 'employee';
    if (!user) {
      // If not found, try User (admin)
      user = await User.findOne({ email });
      userType = 'admin';
    }
    console.log('Login attempt:', { found: !!user, userType });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch ? 'success' : 'failed');
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    
    // Prepare user response based on user type
    let userResponse;
    if (userType === 'employee') {
      // For employees, include permissions
      userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: false,
        permissions: user.permissions || []
      };
    } else {
      // For admin users, give full permissions
      userResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: true,
        permissions: [
          {
            page: "Dashboard",
            url: "/dashboard",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Proposals",
            url: "/dashboard/proposals",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Projects",
            url: "/dashboard/projects",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Tasks",
            url: "/dashboard/tasks",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Customers",
            url: "/dashboard/customers",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Employees",
            url: "/dashboard/employees",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Notifications",
            url: "/dashboard/notifications",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Settings",
            url: "/dashboard/settings",
            actions: { view: true, add: true, edit: true, delete: true }
          }
        ]
      };
    }
    
    res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Employee (for mobile, Express backend)
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received');
    const { email, roleId, name, password } = req.body;
    
    // Check if user already exists
    const existingUser = await UserEmployee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Employee already exists' });
    }
    
    // Fetch role and permissions
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    // Generate a random password if not provided
    let finalPassword = password;
    if (!finalPassword) {
      // Generate password that meets all requirements: 8+ chars, uppercase, lowercase, number, special char
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const special = '@$!%*?&';
      
      let generatedPassword = '';
      generatedPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
      generatedPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
      generatedPassword += numbers[Math.floor(Math.random() * numbers.length)];
      generatedPassword += special[Math.floor(Math.random() * special.length)];
      
      // Fill the rest with random characters
      const allChars = uppercase + lowercase + numbers + special;
      for (let i = 4; i < 12; i++) {
        generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      // Shuffle the password
      finalPassword = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');
    }
    
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    
    // Create new user with only the fields that UserEmployee schema expects
    const newEmployee = new UserEmployee({
      email,
      password: hashedPassword,
      role: roleId,
      permissions: role.permissions || [],
    });
    
    await newEmployee.save();
    
    // Send email with the generated password (only if password was auto-generated)
    if (!password) {
      try {
        const subject = 'Your New Account Details';
        const message = `
          <h1>Welcome to Our Platform</h1>
          <p>Your account has been created successfully.</p>
          <p>Here are your login details:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${finalPassword}</p>
          <p>Please change your password after your first login.</p>
        `;
        await sendEmail(email, subject, message);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the registration if email fails
      }
    }
    
    res.status(201).json({ 
      success: true, 
      message: password ? 'Employee registered successfully' : 'Employee registered successfully and email sent' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: err.message 
    });
  }
});

// Update Employee Role
router.put('/updateRole', async (req, res) => {
  try {
    console.log('Update role request received');
    const { email, roleId } = req.body;
    
    // Find employee by email
    const employee = await UserEmployee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }
    
    // Update role and permissions
    employee.role = roleId;
    employee.permissions = role.permissions || [];
    await employee.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Role updated successfully' 
    });
  } catch (err) {
    console.error('Role update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Role update failed', 
      error: err.message 
    });
  }
});

// Example protected route for mobile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mobile profile endpoint with permissions
router.get('/mobile-profile', authenticateToken, async (req, res) => {
  try {
    // Try to find user in UserEmployee (employees) first
    let user = await UserEmployee.findById(req.user.id).populate('role');
    let userType = 'employee';
    
    if (!user) {
      // If not found, try User (admin)
      user = await User.findById(req.user.id).select('-password');
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare user response based on user type
    let userResponse;
    if (userType === 'employee') {
      // For employees, include permissions
      userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: false,
        permissions: user.permissions || []
      };
    } else {
      // For admin users, give full permissions
      userResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: true,
        permissions: [
          {
            page: "Dashboard",
            url: "/dashboard",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Proposals",
            url: "/dashboard/proposals",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Projects",
            url: "/dashboard/projects",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Tasks",
            url: "/dashboard/tasks",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Customers",
            url: "/dashboard/customers",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Employees",
            url: "/dashboard/employees",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Notifications",
            url: "/dashboard/notifications",
            actions: { view: true, add: true, edit: true, delete: true }
          },
          {
            page: "Settings",
            url: "/dashboard/settings",
            actions: { view: true, add: true, edit: true, delete: true }
          }
        ]
      };
    }
    
    res.json({ user: userResponse });
  } catch (err) {
    console.error('Mobile profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test deep link endpoint
router.get('/test-deep-link', (req, res) => {
  const testToken = 'test-token-123';
  const encodedToken = Buffer.from(testToken).toString('base64');
  const resetUrl = `mobileapp://reset-password?token=${encodedToken}`;
  
  res.json({
    success: true,
    message: 'Test deep link generated',
    data: {
      originalToken: testToken,
      encodedToken: encodedToken,
      deepLinkUrl: resetUrl,
      instructions: [
        '1. Copy the deepLinkUrl',
        '2. Paste it in your mobile browser',
        '3. It should open the mobile app',
        '4. Check the console logs for debugging'
      ]
    }
  });
});

// Forgot Password endpoint for mobile (OTP-based)
router.post('/mobile-forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // First check if it's a hotel admin
    const User = require('../models/user');
    let user = await User.findOne({ email });
    let userType = 'admin';

    if (!user) {
      // If not found, check if it's an employee
      user = await UserEmployee.findOne({ email });
      userType = 'employee';
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User with this email does not exist' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user with OTP
    if (userType === 'admin') {
      await User.findOneAndUpdate(
        { email },
        {
          resetPasswordToken: otp,
          resetPasswordExpire: otpExpiry,
        },
        { new: true }
      );
    } else {
      await UserEmployee.findOneAndUpdate(
        { email },
        {
          resetPasswordToken: otp,
          resetPasswordExpire: otpExpiry,
        },
        { new: true }
      );
    }
    
    // Email template for OTP
    const message = `
      <h1>Password Reset OTP</h1>
      <p>You requested a password reset for your account.</p>
      <p>Your OTP (One-Time Password) is:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h2 style="color: #dc2626; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
      </div>
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Open the mobile app</li>
        <li>Go to the password reset screen</li>
        <li>Enter the OTP: <strong>${otp}</strong></li>
        <li>Enter your new password</li>
      </ol>
      <p><strong>Important:</strong></p>
      <ul>
        <li>This OTP will expire in 10 minutes</li>
        <li>Do not share this OTP with anyone</li>
        <li>If you didn't request this, please ignore this email</li>
      </ul>
    `;

    await sendEmail(user.email, 'Password Reset OTP', message);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email successfully' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request' 
    });
  }
});

// Verify OTP endpoint
router.post('/mobile-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    // First check if it's a hotel admin
    const User = require('../models/user');
    let user = await User.findOne({ 
      email,
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });
    let userType = 'admin';

    if (!user) {
      // If not found, check if it's an employee
      user = await UserEmployee.findOne({ 
        email,
        resetPasswordToken: otp,
        resetPasswordExpire: { $gt: Date.now() }
      });
      userType = 'employee';
    }

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Generate a temporary token for password reset
    const tempToken = crypto.randomBytes(32).toString('hex');
    const tempTokenExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Update user with temporary token
    if (userType === 'admin') {
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: tempToken,
        resetPasswordExpire: tempTokenExpiry
      });
    } else {
      await UserEmployee.findByIdAndUpdate(user._id, {
        resetPasswordToken: tempToken,
        resetPasswordExpire: tempTokenExpiry
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully',
      tempToken: tempToken
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while verifying OTP' 
    });
  }
});

// Reset Password endpoint for mobile (using temp token)
router.post('/mobile-reset-password', async (req, res) => {
  try {
    const { tempToken, newPassword } = req.body;
    
    if (!tempToken || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Temporary token and new password are required' 
      });
    }

    // Find user by temp token (check both admin and employee)
    let user = await User.findOne({
      resetPasswordToken: tempToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    let userType = 'admin';

    if (!user) {
      user = await UserEmployee.findOne({
        resetPasswordToken: tempToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
      userType = 'employee';
    }

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired temporary token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    if (userType === 'admin') {
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
    } else {
      await UserEmployee.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while resetting your password' 
    });
  }
});

module.exports = router;
