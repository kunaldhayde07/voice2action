import { Router } from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  deleteIssue,
  checkDuplicates,
  getMyIssues,
  getNearbyIssues,
  getMapIssues,
  reverseGeocodeController,
} from '../controllers/issue.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Public routes
router.get('/', optionalAuth, getIssues);
router.get('/map', getMapIssues);
router.get('/nearby', getNearbyIssues);
router.get('/geocode/reverse', reverseGeocodeController);
router.get('/check-duplicates', authenticate, checkDuplicates);
router.get('/my-issues', authenticate, getMyIssues);
router.get('/:id', optionalAuth, getIssueById);

// Protected routes
router.post(
  '/',
  authenticate,
  uploadLimiter,
  upload.array('images', 5),
  createIssue
);
router.delete('/:id', authenticate, deleteIssue);

// Admin routes
router.patch('/:id/status', authenticate, requireAdmin, updateIssueStatus);

export default router;