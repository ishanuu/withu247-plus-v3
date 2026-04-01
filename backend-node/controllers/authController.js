import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import logger from '../utils/logger.js';

export const register = async (req, res) => {
  const { username, email, password, firstName, lastName, age, gender } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists',
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      age: age || null,
      gender: gender || 'other',
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    logger.info(`User registered successfully: ${newUser._id}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    logger.error('Registration failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in successfully: ${user._id}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Login failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Get current user failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user',
      details: error.message,
    });
  }
};

export const logout = (req, res) => {
  // In a token-based system, logout is typically handled on the client side
  // by removing the token. This endpoint can be used for logging purposes.
  logger.info(`User logged out: ${req.userId}`);
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};
