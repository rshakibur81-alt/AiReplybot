import { Router } from 'express';
import {
  connectFacebookPage,
  getConnectedPages,
  removePage,
} from '../controllers/pages.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', getConnectedPages as any);
router.post('/connect', connectFacebookPage as any);
router.delete('/:pageId', removePage as any);

export default router;