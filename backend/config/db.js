import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Support both individual environment variables and full Railway connection URLs (DATABASE_URL / MYSQL_URL)
let dbHost = process.env.DB_HOST;
let dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
let dbUser = process.env.DB_USER;
let dbPassword = process.env.DB_PASSWORD;
let dbName = process.env.DB_NAME;

const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || (dbHost && dbHost.startsWith('mysql://') ? dbHost : null);
if (connectionUrl) {
  try {
    const parsed = new URL(connectionUrl);
    dbHost = parsed.hostname;
    dbPort = parsed.port ? parseInt(parsed.port, 10) : 3306;
    dbUser = parsed.username || dbUser;
    dbPassword = decodeURIComponent(parsed.password) || dbPassword;
    dbName = parsed.pathname ? parsed.pathname.replace(/^\//, '') : dbName;
  } catch (e) {
    console.warn('Note: Could not parse database URL string, using individual DB_* variables.');
  }
}

// Determine if connecting to remote Railway cloud host
const isRemoteHost = dbHost && !['localhost', '127.0.0.1'].includes(dbHost);

// Railway and Render production require SSL connections for secure cloud communication
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || (isRemoteHost && process.env.DB_SSL !== 'false' && process.env.DB_SSL !== '0');
const sslConfig = useSsl ? { rejectUnauthorized: false } : undefined;

const poolConfig = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: sslConfig,
};

// Setup pool without database name for local development DB creation
const setupConfig = { ...poolConfig };
delete setupConfig.database;
const setupPool = mysql.createPool(setupConfig);

// Main pool connected directly to the target database
export const pool = mysql.createPool(poolConfig);

export const initDb = async () => {
  try {
    if (!dbName) {
      throw new Error('DB_NAME environment variable must be provided.');
    }

    console.log(`[MySQL Config] Target Host: ${dbHost}:${dbPort} | Database: ${dbName} | SSL: ${useSsl ? 'Enabled' : 'Disabled'}`);

    // 1. Only attempt CREATE DATABASE if running locally. Railway managed cloud instances pre-provision the database schema.
    if (!isRemoteHost) {
      try {
        const setupConn = await setupPool.getConnection();
        await setupConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        setupConn.release();
        console.log(`Local database '${dbName}' ensured.`);
      } catch (err) {
        console.log(`Note: Skipping local database creation: ${err.message}`);
      }
    } else {
      console.log('Connecting to managed Railway MySQL instance (skipping schema creation step)...');
    }

    // 2. Connect directly to target database pool and ensure tables exist
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database!');

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
