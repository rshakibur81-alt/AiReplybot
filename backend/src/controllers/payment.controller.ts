import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// ============================================
// PAYMENT METHODS (Admin managed)
// ============================================

// GET /api/payment/methods — Get all active payment methods
export const getPaymentMethods = async (_req: Request, res: Response): Promise<void> => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('[Payment] Get methods error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
};

export const getActivePaymentMethods = async (_req: Request, res: Response): Promise<void> => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { method: 'asc' },
    });
    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('[Payment] Get active methods error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
};

// POST /api/payment/methods — Create/Update payment method
export const savePaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, method, number, accountType, isActive, instructions, usePgwApi } = req.body;

    if (!method || !number) {
      res.status(400).json({ success: false, message: 'Method name and number are required' });
      return;
    }

    if (id) {
      const updated = await prisma.paymentMethod.update({
        where: { id },
        data: { method, number, accountType: accountType || 'Personal', isActive, instructions, usePgwApi: usePgwApi || false },
      });
      res.json({ success: true, data: updated });
    } else {
      const created = await prisma.paymentMethod.create({
        data: { method, number, accountType: accountType || 'Personal', isActive: isActive ?? true, instructions: instructions || '', usePgwApi: usePgwApi || false },
      });
      res.status(201).json({ success: true, data: created });
    }
  } catch (error) {
    console.error('[Payment] Save method error:', error);
    res.status(500).json({ success: false, message: 'Failed to save payment method' });
  }
};

// DELETE /api/payment/methods/:id
export const deletePaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.paymentMethod.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    console.error('[Payment] Delete method error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete payment method' });
  }
};

// ============================================
// MANUAL PAYMENTS (User submitted)
// ============================================

// POST /api/payment/manual — Submit manual payment
export const submitManualPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId, amount, method, transactionId, screenshot } = req.body;

    if (!planId || !amount || !method || !transactionId) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const payment = await prisma.manualPayment.create({
      data: {
        userId: req.userId!,
        planId,
        amount,
        method,
        transactionId,
        screenshot: screenshot || null,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: payment, message: 'Payment submitted for review' });
  } catch (error) {
    console.error('[Payment] Submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit payment' });
  }
};

// GET /api/payment/manual — Get user's manual payments
export const getUserPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.manualPayment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('[Payment] Get user payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// GET /api/payment/manual/all — Get all manual payments (admin)
export const getAllManualPayments = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.manualPayment.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('[Payment] Get all payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// PATCH /api/payment/manual/:id — Approve/Reject payment (admin)
export const reviewManualPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminNote } = req.body;
    const { id } = req.params;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
      return;
    }

    const payment = await prisma.manualPayment.findUnique({ where: { id } });
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    const updated = await prisma.manualPayment.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    });

    // If APPROVED, update user's plan
    if (status === 'APPROVED') {
      const planType = payment.planId === 'premium' ? 'PREMIUM' : 'PRO';
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: planType as any,
          subscriptionExpiry: expiryDate,
        },
      });

      // Update or create subscription record
      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          planType: payment.planId === 'premium' ? 'professional' : 'starter',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiryDate,
          messagesLimit: payment.planId === 'premium' ? 50000 : 5000,
        },
        update: {
          planType: payment.planId === 'premium' ? 'professional' : 'starter',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiryDate,
          messagesLimit: payment.planId === 'premium' ? 50000 : 5000,
          messagesUsed: 0,
        },
      });
    }

    res.json({ success: true, data: updated, message: `Payment ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('[Payment] Review error:', error);
    res.status(500).json({ success: false, message: 'Failed to review payment' });
  }
};

export default {
  getPaymentMethods,
  getActivePaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  submitManualPayment,
  getUserPayments,
  getAllManualPayments,
  reviewManualPayment,
};