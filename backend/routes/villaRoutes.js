import express from 'express';
import {
  getVillas,
  getVillaById,
  createVilla,
  updateVilla,
  deleteVilla,
  getVillaStats
} from '../controllers/villaController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/stats').get(getVillaStats);

router.route('/')
  .get(getVillas)
  .post(protect, admin, upload.array('images', 5), createVilla);

router.route('/:id')
  .get(getVillaById)
  .put(protect, admin, upload.array('images', 5), updateVilla)
  .delete(protect, admin, deleteVilla);

export default router;
