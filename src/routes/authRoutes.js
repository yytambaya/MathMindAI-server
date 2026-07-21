import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('role').isIn(['student', 'teacher', 'parent']).withMessage('Invalid role'),
], validate, authController.register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, authController.login);

router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, authController.forgotPassword);
router.post('/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 6 })], validate, authController.resetPassword);
router.post('/verify-email', [body('token').notEmpty()], validate, authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
