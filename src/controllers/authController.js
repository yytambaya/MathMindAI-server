import * as authService from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: result });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json({ success: true, data: result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, data: result });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body.token);
  res.json({ success: true, data: result });
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user._id);
  res.json({ success: true, data: result });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: result });
});
