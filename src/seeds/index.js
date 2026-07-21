import { connectDB, disconnectDB } from '../config/db.js';
import { Badge, Lesson, Question, User, AdminProfile } from '../models/index.js';
import { BADGE_DEFINITIONS } from '../config/constants.js';
import { generateLessons, generateQuestions } from './questionGenerator.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await connectDB();
    console.log('Seeding database...');

    await Promise.all([
      Question.deleteMany({}),
      Lesson.deleteMany({}),
      Badge.deleteMany({}),
    ]);

    const questions = generateQuestions(500);
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} questions`);

    const lessons = generateLessons();
    await Lesson.insertMany(lessons);
    console.log(`Seeded ${lessons.length} lessons`);

    await Badge.insertMany(BADGE_DEFINITIONS.map((b) => ({ ...b, criteria: b.description })));
    console.log(`Seeded ${BADGE_DEFINITIONS.length} badges`);

    const adminEmail = 'admin@mathmind.ai';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      admin = await User.create({
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
        isVerified: true,
      });
      await AdminProfile.create({ userId: admin._id });
      console.log('Created admin user: admin@mathmind.ai / Admin123!');
    }

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seed();
