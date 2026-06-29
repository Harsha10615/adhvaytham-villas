import express from 'express';
import { registerUser, loginUser, loginAdmin, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.post('/google-login', googleLogin);

export default router;
