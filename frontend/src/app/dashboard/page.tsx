'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Bot,
  Package,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  Clock,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const chartData = [
  { day: 'Mon', received: 45, replied: 38 },
  { day: 'Tue', received: 52, replied: 45 },
  { day: 'Wed', received: 38, replied: 35 },
  { day: 'Thu', received: 65, replied: 58 },
  { day: 'Fri', received: 55, replied: 50 },
  { day: 'Sat', received: 48, replied: 42 },
  { day: 'Sun', received: 42, replied: 40 },
];

const recentActivity = [
  { action: 'Auto-replied to customer inquiry about pricing', time: '2 min ago', type: 'reply' },
  { action: 'New product "Summer Dress" added to catalog', time: '15 min ago', type: 'product' },
  { action: 'Facebook page "My Store" connected successfully', time: '1 hour ago', type: 'connect' },
  { action: 'AI Instructions updated for greeting tone', time: '3 hours ago', type: 'settings' },
  { action: '50 messages received today - new record!', time: '5 hours ago', type: 'milestone' },
  { action: 'Billing: Pro plan subscription renewed', time: '1 day ago', type: 'billing' },
];

const stats = [
  { label: 'Total Messages', value: '345', icon: MessageSquare, change: '+12%', color: 'from-purple-500 to-violet-500' },
  { label: 'Auto-Replies Sent', value: '298', icon: Bot, change: '+8%', color: 'from-blue-500 to-cyan-500' },
  { label: 'Active Products', value: '24', icon: Package, change: '+3', color: 'from-emerald-500 to-green-500' },
  { label: 'Days Until Expiry', value: '28', icon: CalendarDays, change: 'FREE plan', color: 'from-amber-500 to-orange-500' },
];

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your dashboard at a glance. Track performance and manage your bot.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-colors"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} p-2 flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xs font-medium ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-muted-foreground'
              } flex items-center gap-0.5`}>
                <ArrowUpRight className="h-3 w-3" />
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border border-white/5 bg-card/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Messages Overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Received
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Replied
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                    background: 'rgba(15,15,25,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="received" stroke="#a855f7" fill="url(#receivedGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="replied" stroke="#3b82f6" fill="url(#repliedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/5 bg-card/50 p-6"
        >
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex gap-3"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                  item.type === 'reply' ? 'from-purple-500/20 to-blue-500/20' :
                  item.type === 'product' ? 'from-emerald-500/20 to-green-500/20' :
                  item.type === 'connect' ? 'from-blue-500/20 to-cyan-500/20' :
                  item.type === 'milestone' ? 'from-amber-500/20 to-orange-500/20' :
                  'from-gray-500/20 to-gray-600/20'
                } flex items-center justify-center flex-shrink-0`}>
                  {item.type === 'reply' ? <Bot className="h-4 w-4 text-purple-400" /> :
                   item.type === 'product' ? <Package className="h-4 w-4 text-emerald-400" /> :
                   item.type === 'connect' ? <TrendingUp className="h-4 w-4 text-blue-400" /> :
                   <Clock className="h-4 w-4 text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}