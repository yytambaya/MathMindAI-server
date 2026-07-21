import { beforeAll, afterAll, beforeEach } from 'vitest';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { User, StudentProfile, TeacherProfile, ParentProfile, Question } from '../src/models/index.js';

beforeAll(async () => {
  await connectDB(env.mongoUriTest);
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  const collections = [User, StudentProfile, TeacherProfile, ParentProfile, Question];
  for (const Model of collections) {
    await Model.deleteMany({});
  }
});
