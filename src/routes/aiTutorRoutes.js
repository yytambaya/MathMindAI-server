import { Router } from 'express';
import { body } from 'express-validator';
import * as aiTutorController from '../controllers/aiTutorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/chat', authenticate, authorize('student'), aiLimiter, [
  body('message').notEmpty().withMessage('Message required'),
], validate, aiTutorController.chat);

router.get('/sessions', authenticate, authorize('student'), aiTutorController.getSessions);
router.get('/history', authenticate, authorize('student'), aiTutorController.getHistory);

export default router;
