import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('Health API', () => {
  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth API', () => {
  const user = {
    email: 'student@test.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
  };

  it('registers a student', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('student');
  });

  it('logs in a user', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects unauthorized access', async () => {
    const res = await request(app).get('/api/gamification/stats');
    expect(res.status).toBe(401);
  });

  it('registers teacher and parent roles', async () => {
    const teacher = await request(app).post('/api/auth/register').send({ ...user, email: 'teacher@test.com', role: 'teacher' });
    expect(teacher.status).toBe(201);
    expect(teacher.body.data.user.role).toBe('teacher');

    const parent = await request(app).post('/api/auth/register').send({ ...user, email: 'parent@test.com', role: 'parent' });
    expect(parent.status).toBe(201);
    expect(parent.body.data.user.role).toBe('parent');
  });
});

describe('Practice API', () => {
  it('submits correct answer and awards XP', async () => {
    const { Question: Q } = await import('../src/models/index.js');
    await Q.create({
      category: 'Geometry', topic: 'Triangles', difficulty: 'Easy',
      question: 'Sum of angles?', options: ['90', '180', '270', '360'],
      correctAnswer: '180', explanation: '180 degrees', hint: 'Triangle rule', points: 10,
    });

    const reg = await request(app).post('/api/auth/register').send({
      email: 'practice@test.com', password: 'Test123!', firstName: 'P', lastName: 'T', role: 'student',
    });
    const token = reg.body.data.accessToken;

    const qRes = await request(app).get('/api/practice/questions').set('Authorization', `Bearer ${token}`).query({ topic: 'Triangles' });
    const question = qRes.body.data.questions[0];

    const res = await request(app).post('/api/practice/submit').set('Authorization', `Bearer ${token}`).send({
      questionId: question._id, answer: '180', timeSpent: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.isCorrect).toBe(true);
    expect(res.body.data.xpEarned).toBeGreaterThan(0);
  });
});
