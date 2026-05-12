import { Router } from 'express';
import { voteOnIssue, getMyVotes } from '../controllers/vote.controller';
import { authenticate } from '../middleware/auth.middleware';
import { voteLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/:issueId', authenticate, voteLimiter, voteOnIssue);
router.get('/my-votes', authenticate, getMyVotes);

export default router;