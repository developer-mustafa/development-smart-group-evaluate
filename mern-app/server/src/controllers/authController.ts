import { Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, displayName, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Set default permissions based on role
    let permissions = {
      read: true,
      write: false,
      edit: false,
      delete: false,
    };

    if (role === 'admin') {
      permissions = {
        read: true,
        write: true,
        edit: false,
        delete: false,
      };
    } else if (role === 'super-admin') {
      permissions = {
        read: true,
        write: true,
        edit: true,
        delete: true,
      };
    }

    // Create user
    const user = await User.create({
      email,
      password,
      displayName,
      role: role || 'user',
      permissions,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          permissions: user.permissions,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          permissions: user.permissions,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { displayName },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        id: user!._id,
        email: user!.email,
        displayName: user!.displayName,
        role: user!.role,
        permissions: user!.permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide both passwords' });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
