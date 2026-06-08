'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileCode2,
  Search,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Zap,
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Activity,
  BarChart3,
} from 'lucide-react';

// ─── Mock API Logs Data ───
interface ApiLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  apiCalled: string;
  tokensUsed: number;
  status: 'success' | 'error' | 'timeout';
  duration: string;
  model: string;
}

const apiEndpoints = [
  'POST /api/v1/ai/generate-reply',
  'POST /api/v1/ai/analyze-intent',
  'GET /api/v1/pages',
  'POST /api/v1/auto-replies',
  'POST /api/v1/auth/login',
  'POST /api/v1/auth/register',
  'GET /api/v1/conversations',
  'POST /api/v1/billing/create-checkout-session',
  'POST /webhook/facebook',
  'GET /api/v1/auth/profile',
];

const users = [
  { name: 'Rahim Miah', email: 'rahim@example.com' },
  { name: 'Fatima Begum', email: 'fatima@example.com' },
  { name: 'Kabir Hossain', email: 'kabir@example.com' },
  { name: 'Nusrat Jahan', email: 'nusrat@example.com' },
  { name: 'Hasan Ali', email: 'hasan@example.com' },
  { name: 'Ayesha Khatun', email: 'ayesha@example.com' },
  { name: 'Abdur Rahman', email: 'abdur@example.com' },
  { name: 'Salma Khatun', email: 'salma@example.com' },
  { name: 'Mizanur Rahman', email: 'mizanur@example.com' },
];

const models = ['gemini-pro', 'gemini-pro-vision', 'text-embedding-004'];

// Generate mock logs
const generateLogs = (): ApiLog[] => {
  const logs: ApiLog[] = [];
  const now = new Date();
  const statuses: ('success' | 'error' | 'timeout')[] = ['success', 'success', 'success', 'success', 'error', 'success', 'success', 'timeout', 'success', 'success'];

  for (let i = 0; i < 35; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const minutesAgo = Math.floor(Math.random() * 10080); // 7 days
    const date = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const endpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
    const tokens = Math.floor(Math.random() * 800) + 20;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const durationMs = Math.floor(Math.random() * 2500) + 100;
    const model = models[Math.floor(Math.random() * models.length)];

    logs.push({
      id: `log-${i}`,
      timestamp: date.toISOString(),
      user: user.name,
      userEmail: user.email,
      apiCalled: endpoint,
      tokensUsed: tokens,
      status,
      duration: durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`,
      model,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const allLogs = generateLogs();

const ITEMS_PER_PAGE = 12;

export default function ApiLogsPage() {
  const [logs] = useState<ApiLog[]>(allLogs);
  const [searchUser, setSearchUser] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [endpointFilter, setEndpointFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Compute summary stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLogs = logs.filter((l) => new Date(l.timestamp) >= today);
  const thisMonthLogs = logs.filter((l) => {
    const logDate = new Date(l.timestamp);
    return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
  });

  const totalCallsToday = todayLogs.length;
  const totalTokensThisMonth = thisMonthLogs.reduce((sum, l) => sum + l.tokensUsed, 0);
  const estimatedCost = (totalTokensThisMonth / 1000) * 0.0025; // $0.0025 per 1K tokens
  const successRate = logs.length > 0
    ? Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100)
    : 0;

  // Filter logs
  const filtered = logs.filter((log) => {
    const matchesUser =
      log.user.toLowerCase().includes(searchUser.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchUser.toLowerCase());

    const logDate = new Date(log.timestamp);
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = logDate >= today;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = logDate >= weekAgo;
    } else if (dateFilter === 'month') {
      matchesDate =
        logDate.getMonth() === today.getMonth() &&
        logDate.getFullYear() === today.getFullYear();
    }

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesEndpoint = endpointFilter === 'all' || log.apiCalled === endpointFilter;

    return matchesUser && matchesDate && matchesStatus && matchesEndpoint;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchUser, dateFilter, statusFilter, endpointFilter]);

  // Helper to format timestamp
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const uniqueEndpoints = Array.from(new Set(logs.map((l) => l.apiCalled)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
          <FileCode2 className="h-3 w-3" />
          API Logs
        </div>
        <h1 className="text-2xl font-bold">API Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor API usage, token consumption, and system performance.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-[0.05]" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-1.5 flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div className="text-2xl font-bold">{totalCallsToday}</div>
          <div className="text-xs text-muted-foreground mt-0.5">API Calls Today</div>
        </div>

        <div className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 opacity-[0.05]" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 p-1.5 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">This Month</span>
          </div>
          <div className="text-2xl font-bold">{totalTokensThisMonth.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Tokens Used</div>
        </div>

        <div className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 opacity-[0.05]" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 p-1.5 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Estimated</span>
          </div>
          <div className="text-2xl font-bold">${estimatedCost.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">API Cost (Month)</div>
        </div>

        <div className="relative rounded-xl border border-white/5 bg-card/50 p-4 overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-[0.05]" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-1.5 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Rate</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{successRate}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">Success Rate</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
          />
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Past 7 Days</option>
          <option value="month">This Month</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="timeout">Timeout</option>
        </select>
        <select
          value={endpointFilter}
          onChange={(e) => setEndpointFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 max-w-[220px] truncate transition-colors"
        >
          <option value="all">All Endpoints</option>
          {uniqueEndpoints.map((ep) => (
            <option key={ep} value={ep}>
              {ep}
            </option>
          ))}
        </select>
      </motion.div>

      {/* API Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Timestamp
                  </div>
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    User
                  </div>
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileCode2 className="h-3.5 w-3.5" />
                    API Called
                  </div>
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Tokens
                  </div>
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted-foreground">Duration</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  {/* Timestamp */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                      <span className="text-sm text-muted-foreground">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5 ml-3.5">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold">
                          {log.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[120px]">{log.user}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {log.userEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* API Called */}
                  <td className="px-4 py-3.5">
                    <div className="min-w-0 max-w-[240px]">
                      <p className="text-sm font-mono text-xs truncate">{log.apiCalled}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {log.model}
                      </p>
                    </div>
                  </td>

                  {/* Tokens */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-sm font-medium tabular-nums">
                      {log.tokensUsed.toLocaleString()}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {log.duration}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Success
                      </span>
                    ) : log.status === 'error' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                        <XCircle className="h-3 w-3" />
                        Error
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <AlertCircle className="h-3 w-3" />
                        Timeout
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}

              {/* Empty State */}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FileCode2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No API logs match your filters</p>
                    <button
                      onClick={() => {
                        setSearchUser('');
                        setDateFilter('all');
                        setStatusFilter('all');
                        setEndpointFilter('all');
                      }}
                      className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination + Export */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} logs
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === i + 1
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/10 bg-amber-500/5 text-[10px] text-amber-400/60">
          <FileCode2 className="h-3 w-3" />
          Logs are retained for 30 days • {logs.length} total entries
        </div>
      </div>
    </div>
  );
}