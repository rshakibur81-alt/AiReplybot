import { Router } from 'express';
import {
  createAutoReply,
  getAutoReplies,
  updateAutoReply,
  deleteAutoReply,
  toggleAutoReply,
} from '../controllers/autoreply.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', getAutoReplies as any);
router.post('/', createAutoReply as any);
router.put('/:id', updateAutoReply as any);
router.delete('/:id', deleteAutoReply as any);
router.patch('/:id/toggle', toggleAutoReply as any);

export default router;