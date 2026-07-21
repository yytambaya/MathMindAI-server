import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from './errorHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      throw new AppError('Invalid access token', 401);
    }

    throw error;
  }

  const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401);
  }

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
