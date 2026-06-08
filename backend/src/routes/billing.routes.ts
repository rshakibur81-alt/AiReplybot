import { Router } from 'express';
import {
  createCheckoutSession,
  getSubscription,
  cancelSubscription,
} from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/v1/billing/create-checkout-session — Create Stripe checkout
router.post('/create-checkout-session', authenticate as any, createCheckoutSession as any);

// GET /api/v1/billing/subscription — Get current subscription
router.get('/subscription', authenticate as any, getSubscription as any);

// POST /api/v1/billing/cancel — Cancel subscription
router.post('/cancel', authenticate as any, cancelSubscription as any);

// POST /api/v1/billing/webhook — Stripe webhook (handled in server.ts with raw body)
// This route stays here for reference but the actual endpoint is registered in server.ts
// before express.json() middleware

export default router;