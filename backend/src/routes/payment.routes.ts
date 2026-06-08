import { Router } from 'express';
import {
  getPaymentMethods,
  getActivePaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  submitManualPayment,
  getUserPayments,
  getAllManualPayments,
  reviewManualPayment,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Payment Methods (admin)
router.get('/methods', authenticate as any, getPaymentMethods as any);
router.get('/methods/active', getActivePaymentMethods as any);
router.post('/methods', authenticate as any, savePaymentMethod as any);
router.delete('/methods/:id', authenticate as any, deletePaymentMethod as any);

// Manual Payments (user)
router.post('/manual', authenticate as any, submitManualPayment as any);
router.get('/manual', authenticate as any, getUserPayments as any);

// Manual Payments (admin)
router.get('/manual/all', authenticate as any, getAllManualPayments as any);
router.patch('/manual/:id', authenticate as any, reviewManualPayment as any);

export default router;