import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Requirement 5: Automatically detect whether the application is running Locally vs On Railway
const isRailway = Boolean(
  Object.keys(process.env).some(key => key.startsWith('RAILWAY_')) ||
  process.env.MYSQLHOST ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  process.env.NODE_ENV === 'production'
);

let dbHost, dbPort, dbUser, dbPassword, dbName;

if (isRailway) {
  // Requirement 5 & 6: Railway Deployment. Read MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQL_URL, DATABASE_URL. Never use localhost.
  const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (connectionUrl) {
    try {
      const parsed = new URL(connectionUrl);
      dbHost = parsed.hostname;
      dbPort = parsed.port ? parseInt(parsed.port, 10) : 3306;
      dbUser = parsed.username;
      dbPassword = parsed.password ? decodeURIComponent(parsed.password) : undefined;
      dbName = parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined;
    } catch (e) {
      console.warn('Note: Could not parse database URL string, using individual Railway environment variables.');
    }
  }

  dbHost = dbHost || process.env.MYSQLHOST;
  dbPort = dbPort || (process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 3306);
  dbUser = dbUser || process.env.MYSQLUSER;
  dbPassword = dbPassword !== undefined ? dbPassword : process.env.MYSQLPASSWORD;
  dbName = dbName || process.env.MYSQLDATABASE;

  if (!dbHost || dbHost === 'localhost' || dbHost === '127.0.0.1') {
    throw new Error('FATAL: Detected Railway deployment but database host is set to localhost or missing. You must connect to Railway MySQL.');
  }
} else {
  // Requirement 4: Local Development. Read DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.
  dbHost = process.env.DB_HOST || 'localhost';
  dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  dbUser = process.env.DB_USER || 'root';
  dbPassword = process.env.DB_PASSWORD;
  dbName = process.env.DB_NAME || 'adhvaytham_villas';
}

const isRemoteHost = Boolean(dbHost && !['localhost', '127.0.0.1'].includes(dbHost));
const isInternalRailway = Boolean(dbHost && dbHost.includes('.internal'));
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || (isRemoteHost && !isInternalRailway && process.env.DB_SSL !== 'false' && process.env.DB_SSL !== '0');
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

// Setup pool without database name for local development DB creation (only when running locally)
let setupPool = null;
if (!isRailway && !isRemoteHost) {
  const setupConfig = { ...poolConfig };
  delete setupConfig.database;
  setupPool = mysql.createPool(setupConfig);
}

// Main pool connected directly to the target database
export const pool = mysql.createPool(poolConfig);

export const initDb = async () => {
  try {
    if (!dbName) {
      throw new Error('MYSQLDATABASE or DB_NAME environment variable must be provided.');
    }

    const displayPort = dbPort || 3306;
    console.log(`[Environment Detection] Mode: ${isRailway ? 'Railway Cloud Deployment' : 'Local Development'}`);
    console.log(`[MySQL Config] Target Host: ${dbHost}:${displayPort} | Database: ${dbName} | SSL: ${useSsl ? 'Enabled' : 'Disabled'}`);

    // 1. Only attempt CREATE DATABASE if running locally. Railway managed cloud instances pre-provision the schema.
    if (!isRailway && !isRemoteHost && setupPool) {
      try {
        const setupConn = await setupPool.getConnection();
        await setupConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        setupConn.release();
        console.log(`Local database '${dbName}' ensured.`);
      } catch (err) {
        console.log(`Note: Skipping local database creation: ${err.message}`);
      }
    } else {
      console.log('Connecting to Railway MySQL instance (skipping local database creation)...');
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
    console.error('\n=================================================================');
    console.error('[DATABASE CONNECTION FAILURE] Could not connect to MySQL database!');
    console.error(`Error Message: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    console.error('\nTroubleshooting Tips:');
    if (isRailway) {
      console.error(' 1. Verify that your Railway MySQL service is running and attached to this service.');
      console.error(' 2. Check that MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, and MYSQLDATABASE variables exist in Railway.');
      console.error(' 3. Ensure you are connecting to the correct host (mysql.railway.internal or proxy domain).');
    } else {
      console.error(' 1. Ensure your local MySQL server (XAMPP/WAMP/MySQL Workbench) is actively running.');
      console.error(` 2. Verify that DB_HOST (${dbHost}), DB_PORT (${dbPort}), DB_USER (${dbUser}), and DB_PASSWORD are correct in backend/.env.`);
      console.error(` 3. Check if the database '${dbName}' exists and user credentials are valid.`);
    }
    console.error('=================================================================\n');
  }
};

export default pool;
