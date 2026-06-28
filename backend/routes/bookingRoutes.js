import express from 'express';
import {
  createBooking,
  getBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Users must be logged in to create a booking
router.route('/')
  .post(createBooking)
  .get(protect, admin, getBookings);

router.route('/:id')
  .put(protect, admin, updateBookingStatus);

export default router;
