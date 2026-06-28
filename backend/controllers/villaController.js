import { pool } from '../config/db.js';

// @desc    Get all villas (supports filters and search)
// @route   GET /api/villas
// @access  Public
export const getVillas = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT id AS _id, villa_number AS villaNumber, street_number AS street, villa_type AS type, status, plot_size AS plotSize, built_up_area AS builtUpArea, price, facing, availability, image_url AS images FROM villas';
    let params = [];
    let conditions = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('villa_number LIKE ?');
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY villa_number ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single villa by id or villaNumber
// @route   GET /api/villas/:id
// @access  Public
export const getVillaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a number, otherwise search by villaNumber
    const isNumeric = !isNaN(id);
    let query;
    let params;

    if (isNumeric) {
      query = 'SELECT id AS _id, villa_number AS villaNumber, street_number AS street, villa_type AS type, status, plot_size AS plotSize, built_up_area AS builtUpArea, price, facing, availability, image_url AS images FROM villas WHERE id = ? OR villa_number = ?';
      params = [id, id];
    } else {
      query = 'SELECT id AS _id, villa_number AS villaNumber, street_number AS street, villa_type AS type, status, plot_size AS plotSize, built_up_area AS builtUpArea, price, facing, availability, image_url AS images FROM villas WHERE villa_number = ?';
      params = [id];
    }

    const [rows] = await pool.query(query, params);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Villa not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new villa
// @route   POST /api/villas
// @access  Private/Admin
export const createVilla = async (req, res) => {
  try {
    const {
      villaNumber,
      street,
      type,
      status,
      plotSize,
      builtUpArea,
      price,
      facing,
      availability,
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM villas WHERE villa_number = ?', [villaNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ message: `Villa number ${villaNumber} already exists` });
    }

    // Process files if uploaded
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const [result] = await pool.query(
      `INSERT INTO villas 
        (villa_number, street_number, villa_type, status, plot_size, built_up_area, price, facing, availability, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        villaNumber, 
        street, 
        type, 
        status || 'available', 
        plotSize, 
        builtUpArea, 
        price, 
        facing || null, 
        availability || null, 
        JSON.stringify(imageUrls)
      ]
    );

    res.status(201).json({
      _id: result.insertId,
      villaNumber,
      street,
      type,
      status,
      plotSize,
      builtUpArea,
      price,
      facing,
      availability,
      images: imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a villa
// @route   PUT /api/villas/:id
// @access  Private/Admin
export const updateVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      villaNumber,
      street,
      type,
      status,
      plotSize,
      builtUpArea,
      price,
      facing,
      availability,
      existingImages, // client can send remaining images as a JSON string
    } = req.body;

    const [rows] = await pool.query('SELECT * FROM villas WHERE id = ?', [id]);
    const villa = rows[0];

    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }

    // Handle images update
    let updatedImages = [];
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
      } catch (e) {
        updatedImages = Array.isArray(existingImages) ? existingImages : [existingImages];
      }
    } else {
      updatedImages = villa.image_url || [];
    }

    // Add new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newImages];
    }

    await pool.query(
      `UPDATE villas SET 
        villa_number = COALESCE(?, villa_number),
        street_number = COALESCE(?, street_number),
        villa_type = COALESCE(?, villa_type),
        status = COALESCE(?, status),
        plot_size = COALESCE(?, plot_size),
        built_up_area = COALESCE(?, built_up_area),
        price = COALESCE(?, price),
        facing = COALESCE(?, facing),
        availability = COALESCE(?, availability),
        image_url = ?
       WHERE id = ?`,
       [
         villaNumber || null,
         street || null,
         type || null,
         status || null,
         plotSize || null,
         builtUpArea || null,
         price || null,
         facing || null,
         availability || null,
         JSON.stringify(updatedImages),
         id
       ]
    );

    const [updatedRows] = await pool.query('SELECT id AS _id, villa_number AS villaNumber, street_number AS street, villa_type AS type, status, plot_size AS plotSize, built_up_area AS builtUpArea, price, facing, availability, image_url AS images FROM villas WHERE id = ?', [id]);
    res.json(updatedRows[0]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a villa
// @route   DELETE /api/villas/:id
// @access  Private/Admin
export const deleteVilla = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM villas WHERE id = ?', [req.params.id]);

    if (result.affectedRows > 0) {
      res.json({ message: 'Villa deleted successfully' });
    } else {
      res.status(404).json({ message: 'Villa not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics & stats
// @route   GET /api/villas/stats
// @access  Public
export const getVillaStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM villas');
    const [[{ occupied }]] = await pool.query("SELECT COUNT(*) as occupied FROM villas WHERE status = 'occupied'");
    const [[{ available }]] = await pool.query("SELECT COUNT(*) as available FROM villas WHERE status = 'available'");
    const [[{ construction }]] = await pool.query("SELECT COUNT(*) as construction FROM villas WHERE status = 'construction'");
    const [[{ sold }]] = await pool.query("SELECT COUNT(*) as sold FROM villas WHERE status = 'sold'");

    // Street-wise counts
    const [streetStats] = await pool.query(`
      SELECT 
        street_number AS _id,
        COUNT(*) AS count,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN status = 'construction' THEN 1 ELSE 0 END) AS construction,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) AS sold
      FROM villas 
      GROUP BY street_number 
      ORDER BY street_number ASC
    `);

    res.json({
      total,
      occupied,
      available,
      construction,
      sold,
      streetStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
