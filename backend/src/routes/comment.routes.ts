import { Router } from 'express';
import {
  createComment,
  getComments,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommentSchema } from '../validations/comment.validation';

const router = Router();

router.get('/:issueId', getComments);
router.post('/:issueId', authenticate, validate(createCommentSchema), createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;