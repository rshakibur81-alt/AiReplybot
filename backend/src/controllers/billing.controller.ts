import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../config';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: '2023-10-16' })
  : null;


// ─── Plan Definitions (mirrors Stripe Dashboard products) ───
export const PLAN_CONFIG = {
  pro: {
    priceId: config.stripe.priceIdMonthly,
    planType: 'PRO' as const,
    messagesLimit: 5000,
    pageLimit: 3,
  },
  premium: {
    priceId: config.stripe.priceIdYearly,
    planType: 'PREMIUM' as const,
    messagesLimit: 50000,
    pageLimit: 10,
  },
};

// ============================================
// POST /api/payment/create-checkout-session
// ============================================
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!stripe) {
      res.status(500).json({ success: false, message: 'Stripe not configured' });
      return;
    }

    const { planId } = req.body; // 'pro' or 'premium'
    const userId = req.userId!;

    if (!planId || !['pro', 'premium'].includes(planId)) {
      res.status(400).json({ success: false, message: 'Invalid plan. Choose "pro" or "premium".' });
      return;
    }

    const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Create or retrieve Stripe customer
    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
    });

    let customerId = existingSub?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Create subscription record with stripeCustomerId
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customer.id,
          planType: planId === 'pro' ? 'starter' : 'professional',
          status: 'incomplete',
          messagesLimit: planConfig.messagesLimit,
        },
        update: {
          stripeCustomerId: customer.id,
        },
      });
    }

    // Build success/cancel URLs
    const successUrl = `${config.cors.frontendUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${config.cors.frontendUrl}/dashboard/billing?canceled=true`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planType: planConfig.planType,
        messagesLimit: String(planConfig.messagesLimit),
        pageLimit: String(planConfig.pageLimit),
      },
    });

    res.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id,
      },
    });
  } catch (error: any) {
    console.error('[Stripe] Checkout error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session',
    });
  }
};

// ============================================
// POST /api/payment/webhook (Stripe Webhook)
// Needs raw body — handled in server.ts
// ============================================
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!stripe) {
      res.status(500).json({ success: false, message: 'Stripe not configured' });
      return;
    }

    const sig = req.headers['stripe-signature'] as string;

    // req.body is raw Buffer (set up in server.ts)
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );

    switch (event.type) {
      // ── Checkout completed → activate subscription ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const metadata = session.metadata || {};

        // Retrieve full subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update user's plan in database
        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            planType: 'starter', // Will be overwritten by metadata
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
            messagesLimit: parseInt(metadata.messagesLimit || '5000'),
            messagesUsed: 0,
          },
        });

        // Also update the User model's plan and subscriptionExpiry
        const subRecord = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });
        if (subRecord) {
          await prisma.user.update({
            where: { id: subRecord.userId },
            data: {
              plan: (metadata.planType as any) || 'PRO',
              subscriptionExpiry: currentPeriodEnd,
            },
          });
        }

        console.log(`[Stripe] Checkout completed: User ${metadata.userId} subscribed to ${metadata.planType}`);
        break;
      }

      // ── Invoice paid → reset usage, extend period ──
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await prisma.subscription.update({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: {
              status: 'active',
              currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              messagesUsed: 0,
            },
          });

          // Update user subscriptionExpiry
          const subRecord2 = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });
          if (subRecord2) {
            await prisma.user.update({
              where: { id: subRecord2.userId },
              data: {
                subscriptionExpiry: new Date(stripeSub.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      // ── Subscription canceled/deleted → downgrade to FREE ──
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as Stripe.Subscription;
        const subRecord3 = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: deletedSub.id },
        });
        if (subRecord3) {
          await prisma.subscription.update({
            where: { id: subRecord3.id },
            data: {
              status: 'canceled',
              planType: 'free',
              messagesLimit: 100,
            },
          });
          await prisma.user.update({
            where: { id: subRecord3.userId },
            data: {
              plan: 'FREE',
              subscriptionExpiry: null,
            },
          });
          console.log(`[Stripe] Subscription canceled: User ${subRecord3.userId} downgraded to FREE`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe] Webhook error:', error.message);
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
};

// ============================================
// GET /api/payment/subscription
// ============================================
export const getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });

    if (!subscription) {
      res.status(404).json({ success: false, message: 'No subscription found' });
      return;
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('[Billing] Get subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
};

// ============================================
// POST /api/payment/cancel
// ============================================
export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!stripe) {
      res.status(500).json({ success: false, message: 'Stripe not configured' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      res.status(400).json({ success: false, message: 'No active subscription to cancel' });
      return;
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { userId: req.userId },
      data: { cancelAtPeriodEnd: true },
    });

    res.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error: any) {
    console.error('[Billing] Cancel error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
};

export default {
  createCheckoutSession,
  handleWebhook,
  getSubscription,
  cancelSubscription,
};