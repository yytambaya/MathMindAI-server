import { Router } from 'express';
import { body } from 'express-validator';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', authenticate, authorize('teacher'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']),
  body('deadline').notEmpty().withMessage('Deadline is required'),
], validate, assignmentController.createAssignment);

router.get('/', authenticate, assignmentController.getAssignments);
router.get('/:id', authenticate, assignmentController.getAssignment);
router.put('/:id', authenticate, authorize('teacher'), assignmentController.updateAssignment);
router.delete('/:id', authenticate, authorize('teacher'), assignmentController.deleteAssignment);

export default router;
