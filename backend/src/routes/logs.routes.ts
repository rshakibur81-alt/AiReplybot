import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLogs, getPerformance } from '../controllers/logs.controller';

const router = Router();

router.get('/', authenticate as any, getLogs as any);
router.get('/performance', authenticate as any, getPerformance as any);

export default router;
