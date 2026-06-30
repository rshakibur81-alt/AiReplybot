'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  MessageSquare, Bot, Package, CalendarDays,
  ArrowUpRight, Clock, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';

export default function OverviewPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    autoReplies: 0,
    activeProducts: 0,
    daysUntilExpiry: 0,
    successRate: 0,
    failedReplies: 0,
    totalCustomers: 0,
    topProducts: 0,
    totalOrders: 0,
    chartData: [] as any[],
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
      const [
  subRes,
  pagesRes,
  logsRes,
  perfRes,
  leadsRes,
  productsRes,
  ordersRes,
] = await Promise.allSettled([            
  api.getSubscription(),
  api.getPages(),
  api.getMessageLogs(),
  api.getPerformance(),
  api.getLeads(),
  api.getProducts(),   
  api.getOrders(),     
]);
        const sub = subRes.status === 'fulfilled' ? subRes.value.data.data : null;
        const pages = pagesRes.status === 'fulfilled' ? pagesRes.value.data.data : [];
        const logs = logsRes.status === 'fulfilled'
  ? logsRes.value.data.data
  : [];
     const performance =
  perfRes.status === 'fulfilled'
    ? perfRes.value.data.data
    : {
        total: 0,
        success: 0,
        failed: 0,
        successRate: 0,
      };

const products =
  productsRes.status === 'fulfilled'
    ? productsRes.value.data.data
    : [];
 const orders =
  ordersRes.status === 'fulfilled'
    ? ordersRes.value.data.data
    : [];       
        const leads =
  leadsRes.status === 'fulfilled'
    ? leadsRes.value.data.data
    : {
        totalCustomers: 0,
      };
const last7Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const chartData = last7Days.map((day) => ({
  day,
  received: 0,
  replied: 0,
}));

logs.forEach((log: any) => {
  const d = new Date(log.createdAt);
  const dayName = last7Days[d.getDay()];

  const index = chartData.findIndex((x) => x.day === dayName);

  if (index !== -1) {
    chartData[index].received += 1;

    if (log.status === 'success') {
      chartData[index].replied += 1;
    }
  }
});
        // Days until expiry
        let daysUntilExpiry = 0;
        if (sub?.currentPeriodEnd) {
          const diff = new Date(sub.currentPeriodEnd).getTime() - new Date().getTime();
          daysUntilExpiry = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        }

        setStats({
  totalMessages: logs.length || 0,
  autoReplies: logs.filter((l:any) => l.status === 'success').length || 0,
  activeProducts: pages.length || 0,
  daysUntilExpiry,
 chartData,
          successRate: Number(performance.successRate),
  failedReplies: performance.failed,
  totalCustomers: leads.totalCustomers,  
  topProducts: products.length,  
  totalOrders: orders.length,       
  recentActivity: logs.slice(0, 10),
});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userPlan = (session?.user as any)?.plan || 'FREE';

  const statCards = [
    { label: 'Messages Received', value: stats.totalMessages.toString(), icon: MessageSquare, change: 'This month', color: 'from-purple-500 to-violet-500' },
    { label: 'AI Replies Sent', value: stats.autoReplies.toString(), icon: Bot, change: 'Total rules', color: 'from-blue-500 to-cyan-500' },
    { label: 'Connected Pages', value: stats.activeProducts.toString(), icon: Package, change: 'Facebook pages', color: 'from-emerald-500 to-green-500' },
   { label: 'Days Until Expiry', value: stats.daysUntilExpiry.toString(), icon: CalendarDays, change: `${userPlan} plan`, color: 'from-amber-500 to-orange-500' },
 {
  label: 'AI Success Rate',
  value: `${stats.successRate}%`,
  icon: TrendingUp,
  change: `${stats.failedReplies} Failed`,
  color: 'from-green-500 to-emerald-500'
},
  {
  label: 'Customer Leads',
  value: stats.totalCustomers.toString(),
  icon: Package,
  change: 'Unique Customers',
  color: 'from-pink-500 to-rose-500'
},
  {
  label: 'Products',
  value: stats.topProducts.toString(),
  icon: Package,
  change: 'Top Products',
  color: 'from-indigo-500 to-purple-500'
},
  ];
  

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your dashboard at a glance. Track performance and manage your bot.
        </p>
      </div>

      {/* Stats Cards */}
       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} p-2 flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-0.5">
                {stat.change}
              </span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-950 to-slate-900 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Messages Overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          {stats.chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Data আসতে শুরু করলে chart দেখাবে</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Facebook page connect করুন এবং messages আসলে এখানে দেখাবে</p>
              </div>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="repliedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
  contentStyle={{
    background: '#0f172a',
    border: '1px solid #8B5CF6',
    borderRadius: '16px',
    color: '#fff',
    boxShadow: '0 0 20px rgba(139,92,246,0.4)',
  }}
/>
                 <Area
  type="monotone"
  dataKey="received"
  stroke="#8B5CF6"
  fill="url(#receivedGrad)"
  strokeWidth={4}
  dot={{ r: 6 }}
  activeDot={{ r: 8 }}
/>

<Area
  type="monotone"
  dataKey="replied"
  stroke="#06B6D4"
  fill="url(#repliedGrad)"
  strokeWidth={4}
  dot={{ r: 6 }}
  activeDot={{ r: 8 }}
/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/5 bg-card/50 p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-white/5 rounded animate-pulse" />
                    <div className="h-2 bg-white/5 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            stats.recentActivity.length > 0 ? (
  <div className="space-y-3">
    {stats.recentActivity.slice(0, 5).map((log: any) => (
      <div
        key={log.id}
        className="border border-white/5 rounded-lg p-3"
      >
        <p className="text-sm font-medium">
          {log.customerName || 'Customer'}
        </p>

        <p className="text-xs text-muted-foreground truncate">
          {log.customerMessage}
        </p>

        <p className="text-xs text-green-500 mt-1">
          AI Reply Sent
        </p>
      </div>
    ))}
  </div>
) : (
  <div className="flex flex-col items-center justify-center h-40 text-center">
    <Clock className="h-10 w-10 text-muted-foreground/20 mb-3" />
    <p className="text-sm text-muted-foreground">No activity found</p>
  </div>
)
          )}
        </motion.div>
      </div>
    </div>
  );
}
