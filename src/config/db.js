import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
