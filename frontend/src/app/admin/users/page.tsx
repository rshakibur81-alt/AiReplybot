'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Eye,
  Shield,
  ShieldOff,
  Trash2,
  X,
  Mail,
  CalendarDays,
  Facebook,
  CreditCard,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  ExternalLink,
  Ban,
  UserCheck,
} from 'lucide-react';

// ─── Mock Users Data ───
interface UserData {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  pagesConnected: number;
  status: 'active' | 'suspended' | 'blocked';
  joinedDate: string;
  lastActive: string;
  totalMessages: number;
  aiReplies: number;
  role: 'USER' | 'ADMIN';
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Rahim Miah', email: 'rahim@example.com', plan: 'PRO', pagesConnected: 3, status: 'active', joinedDate: '2024-01-15', lastActive: '2 min ago', totalMessages: 1240, aiReplies: 1100, role: 'USER' },
  { id: '2', name: 'Fatima Begum', email: 'fatima@example.com', plan: 'FREE', pagesConnected: 1, status: 'active', joinedDate: '2024-02-20', lastActive: '15 min ago', totalMessages: 340, aiReplies: 298, role: 'USER' },
  { id: '3', name: 'Kabir Hossain', email: 'kabir@example.com', plan: 'PREMIUM', pagesConnected: 7, status: 'active', joinedDate: '2024-03-10', lastActive: '1 hour ago', totalMessages: 3200, aiReplies: 2900, role: 'USER' },
  { id: '4', name: 'Nusrat Jahan', email: 'nusrat@example.com', plan: 'PRO', pagesConnected: 2, status: 'suspended', joinedDate: '2024-04-05', lastActive: '1 day ago', totalMessages: 890, aiReplies: 750, role: 'USER' },
  { id: '5', name: 'Hasan Ali', email: 'hasan@example.com', plan: 'FREE', pagesConnected: 0, status: 'active', joinedDate: '2024-05-12', lastActive: '3 days ago', totalMessages: 45, aiReplies: 30, role: 'USER' },
  { id: '6', name: 'Shamim Reza', email: 'shamim@example.com', plan: 'PRO', pagesConnected: 3, status: 'blocked', joinedDate: '2024-06-01', lastActive: '1 week ago', totalMessages: 2100, aiReplies: 1800, role: 'USER' },
  { id: '7', name: 'Ayesha Khatun', email: 'ayesha@example.com', plan: 'FREE', pagesConnected: 1, status: 'active', joinedDate: '2024-06-15', lastActive: '5 hours ago', totalMessages: 180, aiReplies: 150, role: 'USER' },
  { id: '8', name: 'Abdur Rahman', email: 'abdur@example.com', plan: 'PREMIUM', pagesConnected: 10, status: 'active', joinedDate: '2024-07-01', lastActive: '30 min ago', totalMessages: 5600, aiReplies: 5100, role: 'ADMIN' },
  { id: '9', name: 'Salma Khatun', email: 'salma@example.com', plan: 'PRO', pagesConnected: 5, status: 'active', joinedDate: '2024-07-20', lastActive: '1 hour ago', totalMessages: 1450, aiReplies: 1300, role: 'USER' },
  { id: '10', name: 'Tariq Islam', email: 'tariq@example.com', plan: 'FREE', pagesConnected: 1, status: 'suspended', joinedDate: '2024-08-05', lastActive: '2 weeks ago', totalMessages: 220, aiReplies: 180, role: 'USER' },
  { id: '11', name: 'Jannatul Ferdous', email: 'jannatul@example.com', plan: 'PRO', pagesConnected: 4, status: 'active', joinedDate: '2024-08-15', lastActive: '10 min ago', totalMessages: 780, aiReplies: 700, role: 'USER' },
  { id: '12', name: 'Mizanur Rahman', email: 'mizanur@example.com', plan: 'PREMIUM', pagesConnected: 8, status: 'active', joinedDate: '2024-09-01', lastActive: '45 min ago', totalMessages: 4200, aiReplies: 3900, role: 'USER' },
];

const ITEMS_PER_PAGE = 8;

const planColors: Record<string, string> = {
  FREE: 'from-gray-500 to-gray-600',
  PRO: 'from-purple-500 to-blue-500',
  PREMIUM: 'from-amber-500 to-orange-500',
};

const statusColors: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  suspended: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  blocked: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter users
  const filtered = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, planFilter, statusFilter]);

  // Toggle user status (active ↔ suspended)
  const toggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' as any }
          : u
      )
    );
  };

  // Delete user
  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setConfirmDelete(null);
  };

  // Stats for the header
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const proUsers = users.filter((u) => u.plan === 'PRO' || u.plan === 'PREMIUM').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
          <Shield className="h-3 w-3" />
          User Management
        </div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View, manage, and moderate all platform users.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold">{totalUsers}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Users</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-emerald-400">{activeUsers}</div>
          <div className="text-xs text-muted-foreground mt-1">Active Accounts</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-card/30 p-4">
          <div className="text-2xl font-bold text-amber-400">{proUsers}</div>
          <div className="text-xs text-muted-foreground mt-1">Paid Users</div>
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
        >
          <option value="all">All Plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="PREMIUM">Premium</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>
      </motion.div>

      {/* Users Table */}
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
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted-foreground">Plan</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted-foreground">Pages</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left hidden lg:table-cell px-4 py-3.5 text-xs font-medium text-muted-foreground">Joined</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  {/* User Name + Email */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${planColors[user.plan]} p-0.5 flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate max-w-[140px]">{user.name}</span>
                          {user.role === 'ADMIN' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r ${planColors[user.plan]} text-white`}>
                      {user.plan === 'FREE' ? 'Free' : user.plan === 'PRO' ? 'Pro' : 'Premium'}
                    </span>
                  </td>

                  {/* Pages Connected */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-sm font-medium">{user.pagesConnected}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${statusColors[user.status]}`}>
                      {user.status === 'active' ? (
                        <><CheckCircle2 className="h-3 w-3" /> Active</>
                      ) : user.status === 'suspended' ? (
                        <><Clock className="h-3 w-3" /> Suspended</>
                      ) : (
                        <><XCircle className="h-3 w-3" /> Blocked</>
                      )}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(user.joinedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      {/* View Details */}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Toggle Suspend */}
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`p-2 rounded-lg transition-all ${
                          user.status === 'active'
                            ? 'text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10'
                            : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'active' || user.status === 'blocked' ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>

                      {/* Delete */}
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}

              {/* Empty State */}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No users match your filters</p>
                    <button
                      onClick={() => { setSearch(''); setPlanFilter('all'); setStatusFilter('all'); }}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
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

      {/* ─────────────────────────────────── */}
      {/* USER DETAILS MODAL */}
      {/* ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/5 bg-card p-6 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${planColors[selectedUser.plan]} p-0.5 flex items-center justify-center shadow-lg`}>
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {selectedUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                      {selectedUser.role === 'ADMIN' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Detail Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Plan</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-gradient-to-r ${planColors[selectedUser.plan]} text-white`}>
                    {selectedUser.plan}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Facebook className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Pages</span>
                  </div>
                  <div className="text-lg font-bold">{selectedUser.pagesConnected}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-muted-foreground">AI Replies</span>
                  </div>
                  <div className="text-lg font-bold">{selectedUser.aiReplies.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-muted-foreground">Messages</span>
                  </div>
                  <div className="text-lg font-bold">{selectedUser.totalMessages.toLocaleString()}</div>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${statusColors[selectedUser.status]}`}>
                    {selectedUser.status === 'active' ? <><CheckCircle2 className="h-3 w-3" /> Active</> :
                     selectedUser.status === 'suspended' ? <><Clock className="h-3 w-3" /> Suspended</> :
                     <><XCircle className="h-3 w-3" /> Blocked</>}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm">
                    {new Date(selectedUser.joinedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Last Active</span>
                  <span className="text-sm">{selectedUser.lastActive}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Auto-Reply Rate</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {selectedUser.totalMessages > 0
                      ? Math.round((selectedUser.aiReplies / selectedUser.totalMessages) * 100)
                      : 0}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toggleStatus(selectedUser.id);
                    setSelectedUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            status:
                              prev.status === 'active'
                                ? 'suspended'
                                : 'active' as any,
                          }
                        : null
                    );
                  }}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all ${
                    selectedUser.status === 'active'
                      ? 'border border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                      : 'border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </button>
                {selectedUser.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      deleteUser(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
                  >
                    Delete User
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 h-10 rounded-xl border border-white/10 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ─────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/5 bg-card p-6 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Delete User?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This action is irreversible. All user data, pages, and messages will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 h-10 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(confirmDelete)}
                  className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}