import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRY || '7d' },
  );
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      displayName: username,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Log audit
    user.addAuditLog('registration', req.ip, req.headers['user-agent']);
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    user.addAuditLog('login', req.ip, req.headers['user-agent']);
    await user.save();

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      valid: true,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const token = generateToken(user);

    res.json({
      message: 'Token refreshed',
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user.id);

    const passwordMatch = await user.comparePassword(currentPassword);

    if (!passwordMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    user.addAuditLog('password_change', req.ip, req.headers['user-agent']);
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
