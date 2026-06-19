import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getOrders } from '../controllers/orders.controller';

const router = Router();

router.get(
  '/',
  authenticate as any,
  getOrders as any
);

export default router;
