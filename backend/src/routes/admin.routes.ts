import { Router } from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  verifyIssue,
  getAnalytics,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', requireSuperAdmin, updateUserRole);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.patch('/issues/:id/verify', verifyIssue);

export default router;