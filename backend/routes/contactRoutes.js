import express from 'express';
import {
  createContact,
  getContacts,
  updateContactStatus
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Users must be logged in to submit a contact form
router.route('/')
  .post(protect, createContact)
  .get(protect, admin, getContacts);

router.route('/:id')
  .put(protect, admin, updateContactStatus);

export default router;
