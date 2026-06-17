import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getLogs,
  getPerformance,
  getLeads,
} from '../controllers/logs.controller';
const router = Router();
router.get('/performance', authenticate as any, getPerformance as any);
router.get(
  '/leads',
  authenticate as any,
  getLeads as any
);

router.get('/', authenticate as any, getLogs as any);


export default router;
