import { IUser } from '../types';
import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, generateTokensForOAuthUser } from '../services/auth.service';
import { verifyRefreshToken } from '../utils/jwt.utils';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils';
import User from '../models/User.model';
import logger from '../utils/logger';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendCreated(res, 'Registration successful! Welcome to Voice2Action.', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        reputationPoints: user.reputationPoints,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, 'Login successful!', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        reputationPoints: user.reputationPoints,
        isVerified: user.isVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  sendSuccess(res, 'Logged out successfully.');
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      sendError(res, 'Refresh token not provided', 401);
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    const payload = { id: user._id.toString(), role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, 'Token refreshed successfully', { accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      return;
    }

    const { accessToken, refreshToken } = generateTokensForOAuthUser(user as IUser);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&user=${encodeURIComponent(
        JSON.stringify({
        _id: (user as IUser)._id,
        name: (user as IUser).name,
        email: (user as IUser).email,
        role: (user as IUser).role,
        avatar: (user as IUser).avatar,
})
      )}`
    );
  } catch (error) {
    logger.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(
    (req.user as IUser)?._id
    ).select('-password');
    sendSuccess(res, 'User profile retrieved', { user });
  } catch (error) {
    sendError(res, 'Failed to retrieve profile', 500);
  }
};