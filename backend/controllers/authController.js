import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

// Generate token helper
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'adhvaytham_villas_production_secret_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Ensure phone column exists or insert gracefully
    const userPhone = mobile || phone || null;
    let result;
    try {
      [result] = await pool.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, userPhone, 'user']
      );
    } catch (colErr) {
      // Fallback if phone column hasn't been added yet
      [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'user']
      );
    }

    res.status(201).json({
      _id: result.insertId,
      name,
      email,
      phone: userPhone,
      role: 'user',
      token: generateToken(result.insertId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login using email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = "admin"', [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
