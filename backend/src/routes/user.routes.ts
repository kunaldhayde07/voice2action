import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  changePassword,
  getLeaderboard,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validations/user.validation';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);
router.patch(
  '/profile/update',
  authenticate,
  upload.single('avatar'),
  validate(updateProfileSchema),
  updateProfile
);
router.patch(
  '/profile/change-password',
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

export default router;