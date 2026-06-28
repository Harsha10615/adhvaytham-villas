import express from 'express';
import {
  createSiteVisit,
  getSiteVisits,
  updateSiteVisitStatus
} from '../controllers/siteVisitController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for creating site visits (anyone can book a site visit)
// Protected admin route for fetching all site visits
router.route('/')
  .post(createSiteVisit)
  .get(protect, admin, getSiteVisits);

router.route('/:id')
  .put(protect, admin, updateSiteVisitStatus);

export default router;
