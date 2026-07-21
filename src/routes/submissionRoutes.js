import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorize('student'), assignmentController.submitAssignment);
router.get('/', authenticate, assignmentController.getSubmissions);
router.patch('/:id/grade', authenticate, authorize('teacher'), assignmentController.gradeSubmission);

export default router;
