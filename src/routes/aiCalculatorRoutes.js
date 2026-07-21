import { Router } from 'express';
import { body } from 'express-validator';
import * as aiCalculatorController from '../controllers/aiCalculatorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/solve', authenticate, aiLimiter, [
  body('input').notEmpty().withMessage('Input required'),
], validate, aiCalculatorController.solve);

export default router;
