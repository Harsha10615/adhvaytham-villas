import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import pool, { initDb } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import villaRoutes from './routes/villaRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import userRoutes from './routes/userRoutes.js';
import siteVisitRoutes from './routes/siteVisitRoutes.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MySQL and Initialize Tables
initDb();

const app = express();

// Production-ready dynamic CORS configuration for Railway and custom deployments
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Normalize origins by removing trailing slashes
    const cleanOrigin = origin.replace(/\/$/, '');
    const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null;
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;
    const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, '') : null;

    if (clientUrl && cleanOrigin === clientUrl) return callback(null, true);
    if (frontendUrl && cleanOrigin === frontendUrl) return callback(null, true);
    if (corsOrigin && (cleanOrigin === corsOrigin || corsOrigin === '*')) return callback(null, true);

    // Automatically allow Railway and Render preview subdomains and deployed URLs
    if (cleanOrigin.endsWith('.up.railway.app') || cleanOrigin.endsWith('.railway.app') || cleanOrigin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    // If no explicit frontend url configured in env or in dev mode, dynamically allow requested origin
    if (!clientUrl && !frontendUrl && !corsOrigin) {
      return callback(null, true);
    }

    // Allow localhost during local development
    if (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.resolve('uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/villas', villaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/site-visits', siteVisitRoutes);

// Serve static React frontend in production if built
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Base API route check
  app.get('/', (req, res) => {
    res.send('Adhvaytham Villas API is running...');
  });
}

// 404 Route handler for unhandled API endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n=================================================================`);
    console.error(`[PORT CONFLICT ERROR] Port ${PORT} is already in use!`);
    console.error(`Another instance of the backend server is already running in your terminal.`);
    console.error(`Please close your older terminal tabs running 'npm run dev' or press Ctrl+C.`);
    console.error(`=================================================================\n`);
    process.exit(1);
  } else {
    console.error('Server Initialization Error:', err);
    process.exit(1);
  }
});
