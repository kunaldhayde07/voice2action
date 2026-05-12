'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  Lock,
  Award,
  AlertCircle,
  FileText,
  ThumbsUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import { Avatar } from '@/components/shared/Avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  cn,
  getBadgeLevel,
  getBadgeConfig,
  formatDate,
} from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(6)
      .regex(/[A-Z]/, 'Needs uppercase')
      .regex(/[a-z]/, 'Needs lowercase')
      .regex(/[0-9]/, 'Needs number'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, refreshUser, updateUserLocally } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.bio !== undefined) formData.append('bio', data.bio);
      if (data.location !== undefined) formData.append('location', data.location);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await usersApi.updateProfile(formData);
      const updatedUser = response.data.data.user;
      updateUserLocally(updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      await usersApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setIsChangingPassword(false);
      passwordForm.reset();
      toast.success('Password changed successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const badgeLevel = getBadgeLevel(user.reputationPoints);
  const badgeCfg = getBadgeConfig(badgeLevel);
  const nextLevelPts = badgeLevel === 'bronze' ? 100 : badgeLevel === 'silver' ? 200 : 500;
  const progress = Math.min((user.reputationPoints / nextLevelPts) * 100, 100);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="My Profile"
        description="Manage your account and track your contributions"
        icon={User}
      />

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="civic-card overflow-hidden"
      >
        {/* Cover banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="px-6 pb-6">
          {/* Avatar + Edit */}
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-gray-800 overflow-hidden bg-blue-100">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Avatar user={user} size="xl" showBadge />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                  <Edit3 className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarPreview(null);
                    setAvatarFile(null);
                    profileForm.reset();
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={profileForm.handleSubmit(handleProfileSave)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Profile info */}
          {!isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    badgeCfg.bg,
                    badgeCfg.color
                  )}
                >
                  {badgeCfg.label} Member
                </span>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              {user.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}
              {user.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  {user.bio}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  {...profileForm.register('name')}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="form-label">Bio</label>
                <textarea
                  {...profileForm.register('bio')}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Tell the community about yourself..."
                />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input
                  {...profileForm.register('location')}
                  className="input-field"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Issues Reported', value: user.reportedIssuesCount, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Resolved',        value: user.resolvedIssuesCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Votes Cast',      value: user.votesCount,           icon: ThumbsUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Reputation',      value: user.reputationPoints,     icon: Award, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.07 }}
            className="civic-card p-4 text-center"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Reputation Progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="civic-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Reputation Progress
          </h3>
          <span className={cn('text-sm font-bold', badgeCfg.color)}>
            {badgeCfg.label}
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{user.reputationPoints} pts</span>
          <span>{nextLevelPts} pts for next level</span>
        </div>
      </motion.div>

      {/* Change Password */}
      {!user.googleId && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="civic-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Change Password
            </h3>
            <button
              onClick={() => setIsChangingPassword((p) => !p)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {isChangingPassword ? 'Cancel' : 'Change'}
            </button>
          </div>

          {isChangingPassword && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
              className="space-y-4"
            >
              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
                <div key={field}>
                  <label className="form-label capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    {...passwordForm.register(field)}
                    type="password"
                    className={cn(
                      'input-field',
                      passwordForm.formState.errors[field] ? 'border-red-300' : ''
                    )}
                  />
                  {passwordForm.formState.errors[field] && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {passwordForm.formState.errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update Password
              </button>
            </motion.form>
          )}
        </motion.div>
      )}
    </div>
  );
}