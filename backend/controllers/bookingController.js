import { pool } from '../config/db.js';

// @desc    Create new site visit booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, date, villaNumber, message } = req.body;

    // Convert ISO date string to MySQL datetime
    const mysqlDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      'INSERT INTO bookings (customer_name, email, phone, booking_date, villa_id, message) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, mysqlDate, villaNumber, message || null]
    );

    res.status(201).json({
      _id: result.insertId,
      name,
      email,
      phone,
      date,
      villaNumber,
      message,
      status: 'Pending'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id AS _id, customer_name AS name, email, phone, booking_date AS date, villa_id AS villaNumber, message, status, created_at AS createdAt FROM bookings ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows > 0) {
      const [rows] = await pool.query('SELECT id AS _id, customer_name AS name, email, phone, booking_date AS date, villa_id AS villaNumber, message, status, created_at AS createdAt FROM bookings WHERE id = ?', [id]);
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
