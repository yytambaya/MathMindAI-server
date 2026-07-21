import { Router } from 'express';
import { body } from 'express-validator';
import * as parentController from '../controllers/parentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/link-child', authenticate, authorize('parent'), parentController.linkChild);
router.get('/children', authenticate, authorize('parent'), parentController.getChildren);
router.get('/child/:id/progress', authenticate, authorize('parent'), parentController.getChildProgress);
router.get('/child/:id/weekly-report', authenticate, authorize('parent'), parentController.getWeeklyReport);

export default router;
