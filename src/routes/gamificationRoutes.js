import { Router } from 'express';
import * as gamificationController from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, gamificationController.getStats);
router.get('/leaderboard', gamificationController.getLeaderboardHandler);
router.get('/progress', authenticate, gamificationController.getProgress);
router.get('/mastery', authenticate, gamificationController.getMastery);
router.get('/teacher', authenticate, gamificationController.getTeacherStats);

export default router;
