'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CreditCard,
  Sparkles,
  Shield,
  Check,
  ArrowUpRight,
  Clock,
  Download,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/api';

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: '৳999',
    replies: '5,000',
    pages: '3',
    popular: true,
    features: [
      '5,000 AI replies per month',
      '3 Facebook pages',
      'Advanced keyword + AI triggers',
      'Real-time analytics dashboard',
      'Custom AI instructions',
      'Priority email support',
      'Product catalog integration',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '৳2,499',
    replies: 'Unlimited',
    pages: '10',
    popular: false,
    features: [
      'Unlimited AI replies',
      'Up to 10 Facebook pages',
      'All Pro features',
      'Advanced regex triggers',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [fetchingSub, setFetchingSub] = useState(true);

  const successParam = searchParams.get('success');
  const canceledParam = searchParams.get('canceled');
  const sessionIdParam = searchParams.get('session_id');

  // Fetch current subscription on mount
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.getSubscription();
        if (res.data.success) {
          setSubscription(res.data.data);
        }
      } catch {
        // No subscription yet — user is on Free plan
      } finally {
        setFetchingSub(false);
      }
    };
    fetchSub();
  }, []);

  // Show success/error toast based on URL params
  useEffect(() => {
    if (successParam === 'true') {
      toast.success('Payment successful! Your plan has been upgraded.', {
        duration: 5000,
        icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
      });
      // Refresh subscription data
      api.getSubscription().then((res) => {
        if (res.data.success) setSubscription(res.data.data);
      }).catch(() => {});
      // Clean URL
      router.replace('/dashboard/billing');
    }
    if (canceledParam === 'true') {
      toast.error('Payment was canceled. You can try again anytime.', {
        duration: 4000,
      });
      router.replace('/dashboard/billing');
    }
  }, [successParam, canceledParam, router]);

  // Handle upgrade — create Stripe checkout session
  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await api.createCheckoutSession({
        planId,
        successUrl: `${window.location.origin}/dashboard/billing`,
        cancelUrl: `${window.location.origin}/dashboard/billing`,
      });

      if (res.data.success && res.data.data.url) {
        // Redirect user to Stripe Checkout
        window.location.href = res.data.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start payment process');
    } finally {
      setLoading(null);
    }
  };

  // Handle cancel subscription
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan at the end of the billing period.')) return;
    setLoading('cancel');
    try {
      await api.cancelSubscription();
      toast.success('Subscription will be canceled at the end of the billing period.');
      const res = await api.getSubscription();
      if (res.data.success) setSubscription(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(null);
    }
  };

  const userPlan = (session?.user as any)?.plan || 'FREE';
  const currentPlanName = userPlan === 'FREE' ? 'Free' : userPlan === 'PRO' ? 'Pro' : 'Premium';
  const isPaidUser = userPlan === 'PRO' || userPlan === 'PREMIUM';
  const expiryDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and payment history.
        </p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3 flex items-center justify-center shadow-xl shadow-purple-500/20">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{currentPlanName} Plan</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                  <Shield className="h-3 w-3" />
                  {subscription?.status === 'active' ? 'Active' : 'Active'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPaidUser && expiryDate
                  ? `Renews on ${expiryDate}`
                  : `${subscription?.messagesUsed || 0}/${subscription?.messagesLimit || 500} replies used this month`}
                {subscription?.cancelAtPeriodEnd && (
                  <span className="text-amber-400 ml-2">(Cancel scheduled)</span>
                )}
              </p>
            </div>
          </div>
          {isPaidUser ? (
            <button
              onClick={handleCancel}
              disabled={loading === 'cancel'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50"
            >
              {loading === 'cancel' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Canceling...</>
              ) : (
                'Cancel Subscription'
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 text-sm font-medium border border-purple-500/20">
              <Sparkles className="h-4 w-4" />
              Free Plan
            </span>
          )}
        </div>

        {/* Usage Bar (only for Free/Pro) */}
        {!isPaidUser && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{subscription?.messagesUsed || 0} / {subscription?.messagesLimit || 500} replies used</span>
              <span>
                {subscription?.messagesLimit
                  ? Math.round(((subscription?.messagesUsed || 0) / subscription.messagesLimit) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{
                  width: `${subscription?.messagesLimit
                    ? Math.round(((subscription?.messagesUsed || 0) / subscription.messagesLimit) * 100)
                    : 0}%`,
                }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan, i) => {
          const isCurrent = userPlan === plan.id.toUpperCase();
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-5 transition-all ${
                isCurrent
                  ? 'border-purple-500/30 bg-purple-500/5'
                  : plan.popular
                  ? 'border-purple-500/20 bg-card/50 shadow-lg shadow-purple-500/5'
                  : 'border-white/5 bg-card/50 hover:border-white/10'
              }`}
            >
              {plan.popular && !isCurrent && (
                <div className="absolute -top-2.5 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-[9px] font-semibold text-white shadow-lg">
                    <Sparkles className="h-2.5 w-2.5" />
                    Popular
                  </span>
                </div>
              )}

              <h3 className="font-semibold">{plan.name}</h3>
              <div className="text-3xl font-bold mt-2">
                {plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  {plan.replies} replies/mo
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  {plan.pages} Facebook pages
                </li>
                {plan.features.slice(2).map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="mt-4 text-center py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-medium border border-purple-500/20">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === plan.id ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Upgrade to {plan.name}</>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/5 bg-card/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Payment History</h3>
          <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left pb-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left pb-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left pb-3 text-xs font-medium text-muted-foreground">Plan</th>
                <th className="text-left pb-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscription?.currentPeriodStart ? (
                <tr className="border-b border-white/5">
                  <td className="py-3 text-sm">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 text-sm">
                    {userPlan === 'PRO' ? '৳999' : userPlan === 'PREMIUM' ? '৳2,499' : '৳0'}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{currentPlanName}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                      {subscription.status === 'active' ? 'Active' : subscription.status}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No payment history yet. Upgrade to a paid plan to see your transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}