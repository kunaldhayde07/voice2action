import User from '../models/User.model';
import { IUser } from '../types';
import { hashPassword } from '../utils/bcrypt.utils';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { RegisterInput } from '../validations/auth.validation';
import { REPUTATION_POINTS } from '../config/constants';

export const registerUser = async (
  data: RegisterInput
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: 'citizen',
    reputationPoints: REPUTATION_POINTS.REPORT_ISSUE, // Welcome bonus
  });

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password) {
    throw new Error('Please login with Google');
  }

  if (!user.isActive) {
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj as IUser, accessToken, refreshToken };
};

export const generateTokensForOAuthUser = (
  user: IUser
): { accessToken: string; refreshToken: string } => {
  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};