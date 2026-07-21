import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/authRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import aiTutorRoutes from './routes/aiTutorRoutes.js';
import aiCalculatorRoutes from './routes/aiCalculatorRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
app.use(apiLimiter);

app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MathMind AI API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/ai-calculator', aiCalculatorRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
