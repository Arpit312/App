import bcrypt from 'bcryptjs';
import User from '../models/User.js';

/**
 * Handle new user registration with password hashing.
 * POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, address_book } = req.body;

    // 1. Basic Field Validations
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Create and save user
    const newUser = new User({
      name,
      email,
      password_hash,
      address_book: address_book || [],
      wishlist_ids: []
    });

    await newUser.save();

    // 5. Respond with user info (omit password_hash)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        address_book: newUser.address_book,
        wishlist_ids: newUser.wishlist_ids
      }
    });
  } catch (error) {
    next(error);
  }
};
