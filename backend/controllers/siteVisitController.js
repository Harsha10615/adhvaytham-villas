import { pool } from '../config/db.js';

// @desc    Create new site visit booking
// @route   POST /api/site-visits
// @access  Public
export const createSiteVisit = async (req, res) => {
  try {
    const { fullName, phone, villaType, preferredDate, preferredTime, message } = req.body;

    if (!fullName || !phone || !villaType || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO site_visits (full_name, phone, villa_type, preferred_date, preferred_time, message) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, phone, villaType, preferredDate, preferredTime, message || null]
    );

    res.status(201).json({
      _id: result.insertId,
      fullName,
      phone,
      villaType,
      preferredDate,
      preferredTime,
      message,
      status: 'Pending'
    });
  } catch (error) {
    console.error('Create Site Visit Error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit site visit booking' });
  }
};

// @desc    Get all site visit bookings
// @route   GET /api/site-visits
// @access  Private/Admin
export const getSiteVisits = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id AS _id, 
        full_name AS fullName, 
        phone, 
        villa_type AS villaType, 
        DATE_FORMAT(preferred_date, '%Y-%m-%d') AS preferredDate, 
        preferred_time AS preferredTime, 
        message, 
        status, 
        created_at AS createdAt 
      FROM site_visits 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Get Site Visits Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch site visit bookings' });
  }
};

// @desc    Update site visit booking status
// @route   PUT /api/site-visits/:id
// @access  Private/Admin
export const updateSiteVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query('UPDATE site_visits SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows > 0) {
      const [rows] = await pool.query(`
        SELECT 
          id AS _id, 
          full_name AS fullName, 
          phone, 
          villa_type AS villaType, 
          DATE_FORMAT(preferred_date, '%Y-%m-%d') AS preferredDate, 
          preferred_time AS preferredTime, 
          message, 
          status, 
          created_at AS createdAt 
        FROM site_visits 
        WHERE id = ?
      `, [id]);
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Site visit booking not found' });
    }
  } catch (error) {
    console.error('Update Site Visit Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update site visit booking' });
  }
};
