import { Router } from 'express';
import { body } from 'express-validator';
import * as gameController from '../controllers/gameController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', authenticate, authorize('parent'), aiLimiter, [
  body('age').isInt({ min: 4, max: 18 }),
  body('topic').notEmpty(),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']),
  body('theme').notEmpty(),
], validate, gameController.createGame);

router.get('/', authenticate, authorize('parent'), gameController.getGames);
router.get('/:id', authenticate, authorize('parent'), gameController.getGame);

export default router;
