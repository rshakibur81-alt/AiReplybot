'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Edit2,
  X,
  Check,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  MessageSquare,
  Globe,
  ListChecks,
  Power,
  PowerOff,
  Sparkles,
  Shield,
  Zap,
  Users,
  Infinity,
} from 'lucide-react';

// ─── Plan Interface ───
interface Plan {
  id: string;
  name: string;
  price: number;
  replyLimit: number | 'unlimited';
  pageLimit: number;
  features: string[];
  isActive: boolean;
  color: string;
  userCount: number;
}

const defaultPlans: Plan[] = [
  {
    id: '1',
    name: 'Free',
    price: 0,
    replyLimit: 500,
    pageLimit: 1,
    features: ['Basic keyword triggers', 'Community support', 'Basic analytics'],
    isActive: true,
    color: 'from-gray-500 to-gray-600',
    userCount: 1250,
  },
  {
    id: '2',
    name: 'Pro',
    price: 999,
    replyLimit: 5000,
    pageLimit: 3,
    features: [
      'Advanced keyword + AI triggers',
      'Real-time analytics dashboard',
      'Custom AI instructions',
      'Priority email support',
      'Product catalog integration',
    ],
    isActive: true,
    color: 'from-purple-500 to-blue-500',
    userCount: 420,
  },
  {
    id: '3',
    name: 'Premium',
    price: 2499,
    replyLimit: 'unlimited' as const,
    pageLimit: 10,
    features: [
      'All Pro features',
      'Advanced regex triggers',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    isActive: true,
    color: 'from-amber-500 to-orange-500',
    userCount: 180,
  },
  {
    id: '4',
    name: 'Enterprise',
    price: 9999,
    replyLimit: 'unlimited' as const,
    pageLimit: 50,
    features: [
      'All Premium features',
      'White-label option',
      'Custom AI model fine-tuning',
      'Dedicated infrastructure',
      '24/7 phone support',
      'On-premise deployment option',
    ],
    isActive: false,
    color: 'from-rose-500 to-pink-500',
    userCount: 12,
  },
];

const emptyPlan: Plan = {
  id: '',
  name: '',
  price: 0,
  replyLimit: 500,
  pageLimit: 1,
  features: [],
  isActive: true,
  color: 'from-purple-500 to-blue-500',
  userCount: 0,
};

const colorOptions = [
  { value: 'from-gray-500 to-gray-600', label: 'Gray' },
  { value: 'from-purple-500 to-blue-500', label: 'Purple → Blue' },
  { value: 'from-amber-500 to-orange-500', label: 'Amber → Orange' },
  { value: 'from-rose-500 to-pink-500', label: 'Rose → Pink' },
  { value: 'from-emerald-500 to-green-500', label: 'Emerald → Green' },
  { value: 'from-cyan-500 to-teal-500', label: 'Cyan → Teal' },
  { value: 'from-indigo-500 to-violet-500', label: 'Indigo → Violet' },
];

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan>(emptyPlan);
  const [featuresInput, setFeaturesInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  // Open create modal
  const openCreateModal = () => {
    setEditingPlan({ ...emptyPlan });
    setFeaturesInput('');
    setErrors({});
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setFeaturesInput(plan.features.join(', '));
    setErrors({});
    setModalOpen(true);
  };

  // Validate form
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!editingPlan.name.trim()) errs.name = 'Plan name is required';
    if (editingPlan.price < 0) errs.price = 'Price cannot be negative';
    if (typeof editingPlan.replyLimit === 'number' && editingPlan.replyLimit < 1) {
      errs.replyLimit = 'Reply limit must be at least 1';
    }
    if (editingPlan.pageLimit < 1) errs.pageLimit = 'Page limit must be at least 1';
    if (!featuresInput.trim()) errs.features = 'At least one feature is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save plan (create or update)
  const savePlan = () => {
    if (!validate()) return;

    const features = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const updatedPlan = {
      ...editingPlan,
      features,
    };

    if (editingPlan.id) {
      // Update existing
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? updatedPlan : p))
      );
    } else {
      // Create new
      const newPlan: Plan = {
        ...updatedPlan,
        id: Date.now().toString(),
        userCount: 0,
      };
      setPlans((prev) => [...prev, newPlan]);
    }

    setModalOpen(false);
  };

  // Toggle plan active status
  const toggleActive = (planId: string) => {
    setPlans((prev) => {
      const plan = prev.find((p) => p.id === planId);
      if (!plan) return prev;

      // If deactivating, show confirmation
      if (plan.isActive) {
        setConfirmDeactivate(planId);
        return prev;
      }

      // If activating, just do it
      return prev.map((p) =>
        p.id === planId ? { ...p, isActive: true } : p
      );
    });
  };

  const confirmToggleOff = () => {
    if (confirmDeactivate) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === confirmDeactivate ? { ...p, isActive: false } : p
        )
      );
      setConfirmDeactivate(null);
    }
  };

  // ─── Render ───
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
            <CreditCard className="h-3 w-3" />
            Subscription Plans
          </div>
          <h1 className="text-2xl font-bold">Manage Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage subscription plans for your users.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </button>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-4"
      >
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold">{plans.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Plans</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-emerald-400">
            {plans.filter((p) => p.isActive).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Active Plans</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-amber-400">
            {plans.filter((p) => p.price > 0).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Paid Plans</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-purple-400">
            {plans.reduce((sum, p) => sum + p.userCount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Subscribers</div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-xl border p-6 transition-all duration-300 ${
              plan.isActive
                ? 'border-white/5 bg-card/50 hover:border-white/10'
                : 'border-white/5 bg-card/20 opacity-60 hover:opacity-80'
            }`}
          >
            {/* Inactive overlay stripe */}
            {!plan.isActive && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  <PowerOff className="h-2.5 w-2.5" />
                  Inactive
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} p-2.5 flex items-center justify-center shadow-lg`}>
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    {plan.isActive && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        <Power className="h-2 w-2" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.userCount} subscribers</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold">
                ৳{plan.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1">/month</span>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[10px] text-muted-foreground">Reply Limit</span>
                </div>
                <div className="text-sm font-medium">
                  {typeof plan.replyLimit === 'number'
                    ? plan.replyLimit.toLocaleString()
                    : 'Unlimited'}
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[10px] text-muted-foreground">Page Limit</span>
                </div>
                <div className="text-sm font-medium">{plan.pageLimit} pages</div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <ListChecks className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-muted-foreground">Features</span>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
              <button
                onClick={() => openEditModal(plan)}
                className="flex-1 h-9 rounded-lg border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Plan
              </button>
              <button
                onClick={() => toggleActive(plan.id)}
                className={`flex-1 h-9 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  plan.isActive
                    ? 'border border-red-500/20 text-red-400 hover:bg-red-500/10'
                    : 'border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                {plan.isActive ? (
                  <><PowerOff className="h-3.5 w-3.5" /> Deactivate</>
                ) : (
                  <><Power className="h-3.5 w-3.5" /> Activate</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─────────────────────────────────── */}
      {/* CREATE / EDIT PLAN MODAL */}
      {/* ─────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/5 bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2 flex items-center justify-center shadow-lg">
                    {editingPlan.id ? <Edit2 className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {editingPlan.id ? 'Edit Plan' : 'Create New Plan'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {editingPlan.id
                        ? `Modifying "${editingPlan.name}" plan`
                        : 'Add a new subscription plan'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Plan Name */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Plan Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <input
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      placeholder="e.g. Pro, Premium, Enterprise"
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors ${
                        errors.name ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Price (৳/month)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                      }
                      placeholder="0"
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors ${
                        errors.price ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Reply Limit + Page Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                      Reply Limit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      <select
                        value={
                          typeof editingPlan.replyLimit === 'number'
                            ? String(editingPlan.replyLimit)
                            : 'unlimited'
                        }
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            replyLimit:
                              e.target.value === 'unlimited'
                                ? 'unlimited'
                                : Number(e.target.value),
                          })
                        }
                        className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors ${
                          errors.replyLimit ? 'border-red-500/50' : 'border-white/10'
                        }`}
                      >
                        <option value="100">100</option>
                        <option value="500">500</option>
                        <option value="1000">1,000</option>
                        <option value="5000">5,000</option>
                        <option value="10000">10,000</option>
                        <option value="50000">50,000</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </div>
                    {errors.replyLimit && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.replyLimit}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                      Page Limit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </span>
                      <select
                        value={editingPlan.pageLimit}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, pageLimit: Number(e.target.value) })
                        }
                        className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors ${
                          errors.pageLimit ? 'border-red-500/50' : 'border-white/10'
                        }`}
                      >
                        {[1, 2, 3, 5, 10, 20, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'page' : 'pages'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.pageLimit && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.pageLimit}</p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Features (comma separated)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground">
                      <ListChecks className="h-4 w-4" />
                    </span>
                    <textarea
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="e.g. Keyword triggers, AI responses, Analytics dashboard"
                      rows={3}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors resize-none ${
                        errors.features ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.features && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.features}</p>
                  )}
                  {featuresInput.trim() && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {featuresInput
                        .split(',')
                        .map((f) => f.trim())
                        .filter(Boolean)
                        .map((feature, fi) => (
                          <span
                            key={fi}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-muted-foreground border border-white/5"
                          >
                            <Check className="h-2.5 w-2.5 text-emerald-400" />
                            {feature}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Color / Is Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                      Color Theme
                    </label>
                    <select
                      value={editingPlan.color}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, color: e.target.value })
                      }
                      className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
                    >
                      {colorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {/* Color preview */}
                    <div
                      className={`h-2 mt-2 rounded-full bg-gradient-to-r ${editingPlan.color}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                      Status
                    </label>
                    <div className="h-11 flex items-center">
                      <button
                        onClick={() =>
                          setEditingPlan({ ...editingPlan, isActive: !editingPlan.isActive })
                        }
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                          editingPlan.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                        }`}
                      >
                        <motion.div
                          animate={{ x: editingPlan.isActive ? 28 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
                        />
                      </button>
                      <span className="text-sm ml-3">
                        {editingPlan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-white/5">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePlan}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300"
                >
                  {editingPlan.id ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────── */}
      {/* DEACTIVATE CONFIRMATION MODAL */}
      {/* ─────────────────────────────────── */}
      <AnimatePresence>
        {confirmDeactivate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeactivate(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/5 bg-card p-6 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Deactivate Plan?</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Users on this plan will retain access until their current billing period ends.
              </p>
              <p className="text-xs text-amber-400/70 mb-6">
                No new users will be able to select this plan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeactivate(null)}
                  className="flex-1 h-10 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleOff}
                  className="flex-1 h-10 rounded-xl bg-amber-500 text-white text-sm font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
                >
                  Deactivate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}