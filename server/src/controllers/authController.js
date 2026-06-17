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

/**
 * Authenticate existing user.
 * POST /api/auth/login
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address_book: user.address_book,
        wishlist_ids: user.wishlist_ids
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new address to a user's address book.
 * POST /api/auth/address
 */
export const addAddress = async (req, res, next) => {
  try {
    const { user_id, street, city, state, postal_code, country, is_default } = req.body;

    if (!user_id || !street || !city || !state || !postal_code || !country) {
      return res.status(400).json({
        success: false,
        message: 'Missing required address fields'
      });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If new address is marked default, set all others to false first
    if (is_default) {
      user.address_book.forEach(addr => {
        addr.is_default = false;
      });
    }

    // Add to address book array
    user.address_book.push({
      street,
      city,
      state,
      postal_code,
      country,
      is_default: is_default || user.address_book.length === 0 // Default true if it's the first address
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address added successfully',
      address_book: user.address_book
    });
  } catch (error) {
    next(error);
  }
};
