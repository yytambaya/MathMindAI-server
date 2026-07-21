import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    permissions: [{ type: String, default: ['manage_users', 'manage_questions', 'view_analytics', 'moderate_chat'] }],
  },
  { timestamps: true }
);

export const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);
