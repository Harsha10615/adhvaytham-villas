import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Determine SSL configuration required by Railway / remote MySQL databases
const isRemoteHost = process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST);
const sslConfig = (process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' || isRemoteHost)
  ? { rejectUnauthorized: false }
  : undefined;

// Create a connection pool without a specific database to check/create the database (for local dev)
const setupPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
  ssl: sslConfig,
});

// Create the main connection pool using the environment variables
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
  ssl: sslConfig,
});

export const initDb = async () => {
  try {
    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error('DB_NAME environment variable must be provided.');
    }

    // 1. Attempt to create database if permitted (skips gracefully on managed cloud databases like Railway)
    try {
      const setupConn = await setupPool.getConnection();
      await setupConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      setupConn.release();
      console.log(`Database '${dbName}' ensured.`);
    } catch (err) {
      console.log(`Note: Skipping CREATE DATABASE (managed Railway cloud instance): ${err.message}`);
    }

    // 2. Connect to the specific database pool and create tables
    const connection = await pool.getConnection();

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Villas Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS villas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        villa_number VARCHAR(20) UNIQUE NOT NULL,
        street_number INT NOT NULL,
        villa_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        plot_size VARCHAR(50) NOT NULL,
        built_up_area VARCHAR(50) NOT NULL,
        price VARCHAR(50) NOT NULL,
        facing VARCHAR(100),
        availability VARCHAR(100),
        image_url JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_villa_number (villa_number)
      )
    `);

    // Bookings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        villa_id VARCHAR(100),
        message TEXT,
        booking_date TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      const [fks] = await connection.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'villa_id' AND TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME != 'PRIMARY'
      `);
      for (let fk of fks) {
        await connection.query(`ALTER TABLE bookings DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
      }
      await connection.query(`ALTER TABLE bookings MODIFY COLUMN villa_id VARCHAR(100)`);
    } catch (err) {
      // Column already modified or FK not present
    }

    // Contacts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Site Visit Bookings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        villa_type VARCHAR(100) NOT NULL,
        preferred_date DATE NOT NULL,
        preferred_time VARCHAR(50) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    console.log('All MySQL tables initialized and ready.');
  } catch (error) {
    console.error('MySQL Initialization Error:', error.message);
  }
};

export default pool;
