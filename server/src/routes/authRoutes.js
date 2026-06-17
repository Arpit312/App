import express from 'express';
import { registerUser, loginUser, addAddress } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/address', addAddress);

export default router;
