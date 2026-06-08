'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  DollarSign,
  Users,
  CreditCard,
  Facebook,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Mock Data ───
const monthlyRevenue = [
  { month: 'Aug', revenue: 45000 },
  { month: 'Sep', revenue: 52000 },
  { month: 'Oct', revenue: 48000 },
  { month: 'Nov', revenue: 63000 },
  { month: 'Dec', revenue: 71000 },
  { month: 'Jan', revenue: 89500 },
];

const usersByPlan = [
  { name: 'Free', value: 1250, color: '#6b7280' },
  { name: 'Pro', value: 420, color: '#a855f7' },
  { name: 'Premium', value: 180, color: '#f59e0b' },
];

const stats = [
  {
    label: 'Total Revenue',
    value: '৳89,500',
    change: '+26%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-500',
    subtitle: 'This month',
  },
  {
    label: 'Total Users',
    value: '1,850',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    subtitle: 'All time',
  },
  {
    label: 'Active Subscriptions',
    value: '600',
    change: '+8%',
    trend: 'up',
    icon: CreditCard,
    color: 'from-purple-500 to-violet-500',
    subtitle: 'Paid plans',
  },
  {
    label: 'Connected Pages',
    value: '2,340',
    change: '+15%',
    trend: 'up',
    icon: Facebook,
    color: 'from-amber-500 to-orange-500',
    subtitle: 'Total pages',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-amber-400">
          ৳{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-xs text-muted-foreground">{payload[0].value} users</p>
      </div>
    );
  }
  return null;
};

export default function AdminOverview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('[Admin Page] Status:', status);
    console.log('[Admin Page] User role:', (session?.user as any)?.role);

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (!mounted || status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto shadow-xl shadow-amber-500/10" />
          <p className="mt-4 text-muted-foreground text-sm">Loading admin overview...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
          <Shield className="h-3 w-3" />
          Admin Overview
        </div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, <span className="text-amber-400">{session.user?.name || session.user?.email}</span>. Here's what's happening.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-all duration-300"
          >
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`} />

            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} p-2 flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Bar Chart - Monthly Revenue (3 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 rounded-xl border border-white/5 bg-card/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Monthly Revenue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              +24.5% vs last period
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <defs>
                  <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="revenue"
                  fill="url(#revenueBar)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart - Users by Plan (2 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-white/5 bg-card/50 p-6"
        >
          <div className="mb-4">
            <h3 className="font-semibold">Users by Plan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution across all plans</p>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersByPlan}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {usersByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend with values */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {usersByPlan.map((plan) => (
              <div key={plan.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-xs text-muted-foreground">{plan.name}</span>
                </div>
                <div className="text-sm font-bold">{plan.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Summary Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-emerald-400">৳3,45,200</div>
          <div className="text-xs text-muted-foreground mt-1">Total Revenue (All Time)</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-blue-400">1,850</div>
          <div className="text-xs text-muted-foreground mt-1">Registered Users</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-purple-400">32.4%</div>
          <div className="text-xs text-muted-foreground mt-1">Conversion Rate (Free → Paid)</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-amber-400">2,340</div>
          <div className="text-xs text-muted-foreground mt-1">Connected Pages</div>
        </div>
      </motion.div>

      {/* Footer Badge */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/10 bg-amber-500/5 text-[10px] text-amber-400/60">
          <Shield className="h-3 w-3" />
          Authorized Personnel Only • All data is read-only
        </div>
      </div>
    </div>
  );
}