import mongoose from 'mongoose';

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    school: { type: String, default: '' },
    subject: { type: String, default: 'Mathematics' },
  },
  { timestamps: true }
);

export const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
