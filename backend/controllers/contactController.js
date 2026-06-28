import { pool } from '../config/db.js';

// @desc    Create new contact message
// @route   POST /api/contacts
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide name, email, and message.' });
    }

    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name || null, email || null, phone || null, subject || null, message || null]
    );

    res.status(201).json({
      _id: result.insertId,
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      status: 'New'
    });
  } catch (error) {
    console.error('Contact creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit contact message' });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id AS _id, name, email, phone, subject, message, status, created_at AS createdAt FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact message status
// @route   PUT /api/contacts/:id
// @access  Private/Admin
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows > 0) {
      const [rows] = await pool.query('SELECT id AS _id, name, email, phone, subject, message, status, created_at AS createdAt FROM contacts WHERE id = ?', [id]);
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Contact message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
