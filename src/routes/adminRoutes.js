import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

router.get('/lessons', adminController.getLessons);
router.post('/lessons', adminController.createLesson);

router.get('/chat', adminController.getChatHistory);
router.patch('/chat/:id', adminController.moderateChat);

router.get('/analytics', adminController.getAnalytics);

export default router;
