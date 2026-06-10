'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, DollarSign, Users, CreditCard, Facebook,
  TrendingUp, TrendingDown, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '@/lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-amber-400">৳{payload[0].value.toLocaleString()}</p>
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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    connectedPages: 0,
    allTimeRevenue: 0,
    conversionRate: 0,
    usersByPlan: [] as any[],
    monthlyRevenue: [] as any[],
    pendingPayments: 0,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchData = async () => {
      try {
        const [usersRes, paymentsRes] = await Promise.allSettled([
          api.getProfile(),
          api.getAllManualPayments(),
        ]);

        const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data.data || [] : [];

        // Calculate real stats from payments
        const approvedPayments = payments.filter((p: any) => p.status === 'APPROVED');
        const pendingPayments = payments.filter((p: any) => p.status === 'PENDING');
        const totalRevenue = approvedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

        // Users by plan from payments
        const proUsers = approvedPayments.filter((p: any) => p.planId === 'pro').length;
        const premiumUsers = approvedPayments.filter((p: any) => p.planId === 'premium').length;

        // Monthly revenue (last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap: any = {};
        approvedPayments.forEach((p: any) => {
          const month = monthNames[new Date(p.createdAt).getMonth()];
          monthlyMap[month] = (monthlyMap[month] || 0) + (p.amount || 0);
        });
        const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

        const usersByPlan = [
          { name: 'Free', value: Math.max(0, (data.totalUsers || 1) - proUsers - premiumUsers), color: '#6b7280' },
          { name: 'Pro', value: proUsers, color: '#a855f7' },
          { name: 'Premium', value: premiumUsers, color: '#f59e0b' },
        ];

        setData({
          totalRevenue,
          totalUsers: 0,
          activeSubscriptions: proUsers + premiumUsers,
          connectedPages: 0,
          allTimeRevenue: totalRevenue,
          conversionRate: 0,
          usersByPlan,
          monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : [],
          pendingPayments: pendingPayments.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  if (!mounted || status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground text-sm">Loading admin overview...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') return null;

  const statCards = [
    { label: 'Total Revenue', value: `৳${data.totalRevenue.toLocaleString()}`, change: 'This month', trend: 'up', icon: DollarSign, color: 'from-emerald-500 to-green-500', subtitle: 'Approved payments' },
    { label: 'Active Subscriptions', value: data.activeSubscriptions.toString(), change: 'Paid plans', trend: 'up', icon: CreditCard, color: 'from-purple-500 to-violet-500', subtitle: 'Pro + Premium' },
    { label: 'Pending Payments', value: data.pendingPayments.toString(), change: 'Needs review', trend: data.pendingPayments > 0 ? 'up' : 'down', icon: Users, color: 'from-amber-500 to-orange-500', subtitle: 'Manual payments' },
    { label: 'All Time Revenue', value: `৳${data.allTimeRevenue.toLocaleString()}`, change: 'Total earned', trend: 'up', icon: TrendingUp, color: 'from-blue-500 to-cyan-500', subtitle: 'All time' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
          <Shield className="h-3 w-3" /> Admin Overview
        </div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, <span className="text-amber-400">{session.user?.name || session.user?.email}</span>. Here's what's happening.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} p-2 flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-20 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 rounded-xl border border-white/5 bg-card/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Monthly Revenue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Approved payments by month</p>
            </div>
          </div>
          {data.monthlyRevenue.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">কোনো approved payment নেই এখনো</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <defs>
                    <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="revenue" fill="url(#revenueBar)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-white/5 bg-card/50 p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Users by Plan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution across all plans</p>
          </div>
          {data.usersByPlan.every(p => p.value === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">কোনো paid user নেই এখনো</p>
              </div>
            </div>
          ) : (
            <>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.usersByPlan} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                      {data.usersByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {data.usersByPlan.map((plan) => (
                  <div key={plan.name} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                      <span className="text-xs text-muted-foreground">{plan.name}</span>
                    </div>
                    <div className="text-sm font-bold">{plan.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-emerald-400">৳{data.allTimeRevenue.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Revenue (All Time)</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-purple-400">{data.activeSubscriptions}</div>
          <div className="text-xs text-muted-foreground mt-1">Active Subscriptions</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-amber-400">{data.pendingPayments}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending Payments</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-blue-400">{data.usersByPlan.find(p => p.name === 'Pro')?.value || 0} / {data.usersByPlan.find(p => p.name === 'Premium')?.value || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">Pro / Premium Users</div>
        </div>
      </motion.div>

      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/10 bg-amber-500/5 text-[10px] text-amber-400/60">
          <Shield className="h-3 w-3" /> Authorized Personnel Only • Real-time data
        </div>
      </div>
    </div>
  );
}
