import { Router } from 'express';
import * as practiceController from '../controllers/practiceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/topics', practiceController.getTopics);
router.get('/lessons', authenticate, practiceController.getLessons);
router.get('/lessons/:id', authenticate, practiceController.getLesson);
router.post('/lessons/:id/complete', authenticate, authorize('student'), practiceController.completeLesson);
router.get('/questions', authenticate, practiceController.getQuestions);
router.post('/submit', authenticate, authorize('student'), practiceController.submitAnswer);
router.get('/recommendations', authenticate, authorize('student'), practiceController.getRecommendationsHandler);

export default router;
