import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLogs } from '../controllers/logs.controller';

const router = Router();

router.get('/', authenticate as any, getLogs as any);

export default router;
