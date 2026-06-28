import express from 'express';
import {
  createContact,
  getContacts,
  updateContactStatus
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Contact inquiries are public for website visitors; fetching is protected for admin
router.route('/')
  .post(createContact)
  .get(protect, admin, getContacts);

router.route('/:id')
  .put(protect, admin, updateContactStatus);

export default router;
