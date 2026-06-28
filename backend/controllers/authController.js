import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

// Requirement 11: Helper for development-only logging
const isDev = process.env.NODE_ENV !== 'production';
const logDev = (...args) => {
  if (isDev) {
    console.log('[AUTH DEV LOG]', ...args);
  }
};

// Requirement 3: Generate token helper enforcing mandatory process.env.JWT_SECRET without fallbacks
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('SERVER_CONFIG_ERROR: JWT_SECRET environment variable is missing.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// Requirement 6 & 15: Reusable helper to normalize email addresses
const normalizeEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

// Requirement 10, 13 & 15: Reusable helper to format consistent JSON user payloads
const formatUserResponse = (user, token) => ({
  _id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  ...(user.phone !== undefined && user.phone !== null ? { phone: user.phone } : {}),
  token,
});

// Requirement 15: Shared authentication lookup and comparison logic
const performLogin = async (email, password, requiredRole = null) => {
  if (!email || !password) {
    return { status: 400, data: { message: 'Please provide email and password' } };
  }

  const cleanEmail = normalizeEmail(email);
  logDev(`Attempting login for email: ${cleanEmail} (Role filter: ${requiredRole || 'any'})`);

  let query = 'SELECT * FROM users WHERE email = ?';
  const params = [cleanEmail];

  if (requiredRole) {
    query += ' AND role = ?';
    params.push(requiredRole);
  }

  const [rows] = await pool.query(query, params);
  const user = rows && rows[0];

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user.id);
    logDev(`Login successful for user ID: ${user.id}`);
    return { status: 200, data: formatUserResponse(user, token) };
  } else {
    logDev(`Login failed for email: ${cleanEmail} (Invalid credentials or unauthorized)`);
    const message = requiredRole === 'admin'
      ? 'Invalid admin credentials or unauthorized access'
      : 'Invalid email or password';
    return { status: 401, data: { message } };
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile, phone } = req.body;

    // Requirement 5: Validate request fields before querying database
    if (!name || !name.trim() || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    logDev(`Checking duplicate user registration for: ${cleanEmail}`);

    // Requirement 12: Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      logDev(`Registration rejected: duplicate email ${cleanEmail}`);
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Requirement 7: Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Requirement 9: Detect phone column gracefully without crashing
    const userPhone = mobile || phone || null;
    let result;
    try {
      [result] = await pool.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [cleanName, cleanEmail, hashedPassword, userPhone, 'user']
      );
    } catch (colErr) {
      logDev('Phone column insert failed, fallback without phone column:', colErr.message);
      [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [cleanName, cleanEmail, hashedPassword, 'user']
      );
    }

    const userId = result.insertId;
    const token = generateToken(userId);

    logDev(`User registered successfully with ID: ${userId}`);

    // Requirement 10 & 13: Consistent response payload
    return res.status(201).json({
      _id: userId,
      name: cleanName,
      email: cleanEmail,
      phone: userPhone,
      role: 'user',
      token,
    });
  } catch (error) {
    console.error('[AUTH REGISTER ERROR]', error.message);
    if (error.message && error.message.includes('SERVER_CONFIG_ERROR')) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET variable is not configured.' });
    }
    return res.status(500).json({ message: 'An unexpected server error occurred during registration.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await performLogin(email, password, null);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error.message);
    if (error.message && error.message.includes('SERVER_CONFIG_ERROR')) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET variable is not configured.' });
    }
    return res.status(500).json({ message: 'An unexpected server error occurred during login.' });
  }
};

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await performLogin(email, password, 'admin');
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('[AUTH ADMIN LOGIN ERROR]', error.message);
    if (error.message && error.message.includes('SERVER_CONFIG_ERROR')) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET variable is not configured.' });
    }
    return res.status(500).json({ message: 'An unexpected server error occurred during admin login.' });
  }
};
