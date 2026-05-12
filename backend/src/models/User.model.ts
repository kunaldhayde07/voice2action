import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';
import { comparePassword } from '../utils/bcrypt.utils';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'super_admin'],
      default: 'citizen',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    reputationPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportedIssuesCount: {
      type: Number,
      default: 0,
    },
    resolvedIssuesCount: {
      type: Number,
      default: 0,
    },
    votesCount: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ reputationPoints: -1 });
UserSchema.index({ createdAt: -1 });

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

// Virtual for badge level
UserSchema.virtual('badgeLevel').get(function () {
  if (this.reputationPoints >= 500) return 'platinum';
  if (this.reputationPoints >= 200) return 'gold';
  if (this.reputationPoints >= 100) return 'silver';
  return 'bronze';
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;