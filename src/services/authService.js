import bcrypt from 'bcryptjs';
import {
  User, StudentProfile, TeacherProfile, ParentProfile, AdminProfile, Leaderboard,
} from '../models/index.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateInviteCode } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';

async function createRoleProfile(user) {
  switch (user.role) {
    case 'student': {
      const profile = await StudentProfile.create({
        userId: user._id,
        inviteCode: generateInviteCode(),
      });
      await Leaderboard.create({ studentId: user._id, displayName: `${user.firstName} ${user.lastName}` });
      return profile;
    }
    case 'teacher':
      return TeacherProfile.create({ userId: user._id });
    case 'parent':
      return ParentProfile.create({ userId: user._id });
    case 'admin':
      return AdminProfile.create({ userId: user._id });
    default:
      throw new AppError('Invalid role', 400);
  }
}

async function getProfile(user) {
  switch (user.role) {
    case 'student':
      return StudentProfile.findOne({ userId: user._id });
    case 'teacher':
      return TeacherProfile.findOne({ userId: user._id });
    case 'parent':
      return ParentProfile.findOne({ userId: user._id });
    case 'admin':
      return AdminProfile.findOne({ userId: user._id });
    default:
      return null;
  }
}

function generateTokens(user) {
  const payload = { id: user._id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function register({ email, password, firstName, lastName, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = signAccessToken({ email, purpose: 'verify' });

  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role,
    verificationToken,
  });

  await createRoleProfile(user);

  if (env.emailMock) {
    console.log(`[EMAIL MOCK] Verify email token for ${email}: ${verificationToken}`);
  }

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    user: { id: user._id, email, firstName, lastName, role, isVerified: user.isVerified },
    ...tokens,
    verificationToken: env.emailMock ? verificationToken : undefined,
  };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  user.lastLoginAt = new Date();
  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const profile = await getProfile(user);
  return {
    user: {
      id: user._id, email: user.email, firstName: user.firstName,
      lastName: user.lastName, role: user.role, isVerified: user.isVerified,
    },
    profile,
    ...tokens,
  };
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw new AppError('Refresh token required', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired', 401);
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      throw new AppError('Invalid refresh token', 401);
    }

    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();
  return tokens;
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return { message: 'If email exists, reset link sent' };

  const resetToken = signAccessToken({ id: user._id, purpose: 'reset' });
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  if (env.emailMock) {
    console.log(`[EMAIL MOCK] Reset password token for ${email}: ${resetToken}`);
    return { message: 'Reset link sent (mock)', resetToken };
  }
  return { message: 'If email exists, reset link sent' };
}

export async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: 'Password reset successful' };
}

export async function verifyEmail(token) {
  const user = await User.findOne({ verificationToken: token });
  if (!user) throw new AppError('Invalid verification token', 400);

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  return { message: 'Email verified successfully' };
}

export async function getMe(userId) {
  const user = await User.findById(userId).select('-passwordHash -refreshToken');
  if (!user) throw new AppError('User not found', 404);
  const profile = await getProfile(user);
  return { user, profile };
}

export async function updateProfile(userId, data) {
  const user = await User.findByIdAndUpdate(
    userId,
    { firstName: data.firstName, lastName: data.lastName },
    { new: true }
  ).select('-passwordHash -refreshToken');
  return user;
}
