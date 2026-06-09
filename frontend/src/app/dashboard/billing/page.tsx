'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CreditCard, Sparkles, Shield, Check, Download,
  Loader2, CheckCircle2, X, Smartphone, Globe,
} from 'lucide-react';
import api from '@/lib/api';

const plans = [
  {
    id: 'pro', name: 'Pro', price: '৳999', amount: 999,
    replies: '5,000', pages: '3', popular: true,
    features: [
      '5,000 AI replies per month', '3 Facebook pages',
      'Advanced keyword + AI triggers', 'Real-time analytics dashboard',
      'Custom AI instructions', 'Priority email support', 'Product catalog integration',
    ],
  },
  {
    id: 'premium', name: 'Premium', price: '৳2,499', amount: 2499,
    replies: 'Unlimited', pages: '10', popular: false,
    features: [
      'Unlimited AI replies', 'Up to 10 Facebook pages', 'All Pro features',
      'Advanced regex triggers', 'API access', 'Dedicated account manager',
      'Custom integrations', 'SLA guarantee',
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

  // Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentTab, setPaymentTab] = useState<'manual' | 'stripe'>('manual');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const successParam = searchParams.get('success');
  const canceledParam = searchParams.get('canceled');

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.getSubscription();
        if (res.data.success) setSubscription(res.data.data);
      } catch {}
      finally { setFetchingSub(false); }
    };
    fetchSub();
  }, []);

  useEffect(() => {
    if (successParam === 'true') {
      toast.success('Payment successful! Your plan has been upgraded.');
      api.getSubscription().then((res) => {
        if (res.data.success) setSubscription(res.data.data);
      }).catch(() => {});
      router.replace('/dashboard/billing');
    }
    if (canceledParam === 'true') {
      toast.error('Payment was canceled.');
      router.replace('/dashboard/billing');
    }
  }, [successParam, canceledParam, router]);

  const handleUpgrade = async (plan: any) => {
    setSelectedPlan(plan);
    setPaymentTab('manual');
    setTransactionId('');
    setSelectedMethod('');
    try {
      const res = await api.getActivePaymentMethods();
      if (res.data.success) setPaymentMethods(res.data.data);
    } catch {}
    setShowModal(true);
  };

  const handleStripePayment = async () => {
    if (!selectedPlan) return;
    setLoading('stripe');
    try {
      const res = await api.createCheckoutSession({
        planId: selectedPlan.id,
        successUrl: `${window.location.origin}/dashboard/billing?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
      });
      if (res.data.success && res.data.data.url) {
        window.location.href = res.data.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Stripe payment failed');
    } finally {
      setLoading(null);
    }
  };

  const handleManualPayment = async () => {
    if (!transactionId || !selectedPlan || !selectedMethod) {
      toast.error('Transaction ID এবং Payment Method দিন');
      return;
    }
    setLoading('manual');
    try {
      await api.submitManualPayment({
        planId: selectedPlan.id,
        amount: selectedPlan.amount,
        method: selectedMethod,
        transactionId,
      });
      toast.success('Payment submit হয়েছে! Admin ২৪ ঘণ্টার মধ্যে verify করবে।');
      setShowModal(false);
      setTransactionId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment submit failed');
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setLoading('cancel');
    try {
      await api.cancelSubscription();
      toast.success('Subscription canceled.');
      const res = await api.getSubscription();
      if (res.data.success) setSubscription(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setLoading(null);
    }
  };

  const userPlan = (session?.user as any)?.plan || 'FREE';
  const currentPlanName = userPlan === 'FREE' ? 'Free' : userPlan === 'PRO' ? 'Pro' : 'Premium';
  const isPaidUser = userPlan === 'PRO' || userPlan === 'PREMIUM';
  const expiryDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payment history.</p>
      </div>

      {/* Current Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3 flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{currentPlanName} Plan</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                  <Shield className="h-3 w-3" /> Active
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPaidUser && expiryDate ? `Renews on ${expiryDate}` : `${subscription?.messagesUsed || 0}/${subscription?.messagesLimit || 500} replies used`}
              </p>
            </div>
          </div>
          {isPaidUser ? (
            <button onClick={handleCancel} disabled={loading === 'cancel'}
              className="px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all disabled:opacity-50">
              {loading === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 text-sm border border-purple-500/20">
              <Sparkles className="h-4 w-4" /> Free Plan
            </span>
          )}
        </div>
        {!isPaidUser && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{subscription?.messagesUsed || 0} / {subscription?.messagesLimit || 500} replies used</span>
              <span>{subscription?.messagesLimit ? Math.round(((subscription?.messagesUsed || 0) / subscription.messagesLimit) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: '0%' }}
                animate={{ width: `${subscription?.messagesLimit ? Math.round(((subscription?.messagesUsed || 0) / subscription.messagesLimit) * 100) : 0}%` }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan, i) => {
          const isCurrent = userPlan === plan.id.toUpperCase();
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-5 transition-all ${isCurrent ? 'border-purple-500/30 bg-purple-500/5' : plan.popular ? 'border-purple-500/20 bg-card/50' : 'border-white/5 bg-card/50'}`}>
              {plan.popular && !isCurrent && (
                <div className="absolute -top-2.5 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-[9px] font-semibold text-white">
                    <Sparkles className="h-2.5 w-2.5" /> Popular
                  </span>
                </div>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />{feat}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="mt-4 text-center py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm border border-purple-500/20">Current Plan</div>
              ) : (
                <button onClick={() => handleUpgrade(plan)} className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                  <Sparkles className="h-4 w-4" /> Upgrade to {plan.name}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/5 bg-card/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Payment History</h3>
          <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
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
                <td className="py-3 text-sm">{new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="py-3 text-sm">{userPlan === 'PRO' ? '৳999' : userPlan === 'PREMIUM' ? '৳2,499' : '৳0'}</td>
                <td className="py-3 text-sm text-muted-foreground">{currentPlanName}</td>
                <td className="py-3"><span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Active</span></td>
              </tr>
            ) : (
              <tr><td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No payment history yet.</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showModal && selectedPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Upgrade to {selectedPlan.name}</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tab */}
              <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
                <button onClick={() => setPaymentTab('manual')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${paymentTab === 'manual' ? 'bg-purple-500 text-white' : 'text-muted-foreground hover:text-white'}`}>
                  <Smartphone className="h-4 w-4" /> bKash / Nagad
                </button>
                <button onClick={() => setPaymentTab('stripe')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${paymentTab === 'stripe' ? 'bg-purple-500 text-white' : 'text-muted-foreground hover:text-white'}`}>
                  <Globe className="h-4 w-4" /> Card Payment
                </button>
              </div>

              {paymentTab === 'manual' ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">Payment Methods:</p>
                    {paymentMethods.length > 0 ? paymentMethods.map((method: any) => (
                      <div key={method.id} onClick={() => setSelectedMethod(method.method)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer mb-2 transition-all ${selectedMethod === method.method ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'}`}>
                        <div>
                          <p className="text-sm font-medium capitalize">{method.method}</p>
                          <p className="text-xs text-muted-foreground">{method.number}</p>
                          <p className="text-xs text-muted-foreground">{method.instructions}</p>
                        </div>
                        {selectedMethod === method.method && <Check className="h-4 w-4 text-purple-400" />}
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">কোনো payment method পাওয়া যায়নি।</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Transaction ID</label>
                    <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="যেমন: 8N7A2X3K9P"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500" />
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 text-xs text-muted-foreground">
                    <p>💰 Amount: <span className="text-white font-medium">{selectedPlan.price}</span></p>
                    <p className="mt-1">✅ Payment করার পর Transaction ID দিন। Admin verify করলে plan activate হবে।</p>
                  </div>

                  <button onClick={handleManualPayment} disabled={loading === 'manual' || !transactionId || !selectedMethod}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-all">
                    {loading === 'manual' ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="h-4 w-4" /> Payment Submit করুন</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <CreditCard className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                    <p className="text-sm font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground mt-1">Visa, Mastercard সহ সব card accept করা হয়</p>
                    <p className="text-lg font-bold mt-3">{selectedPlan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                  <button onClick={handleStripePayment} disabled={loading === 'stripe'}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-all">
                    {loading === 'stripe' ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting...</> : <><CreditCard className="h-4 w-4" /> Card দিয়ে Pay করুন</>}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
