'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  WalletCards,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  X,
  Check,
  AlertTriangle,
  MessageSquare,
  User,
  CreditCard,
  CalendarDays,
} from 'lucide-react';
import api from '@/lib/api';

interface ManualPayment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  method: string;
  transactionId: string;
  screenshot: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
  user: { name: string; email: string };
}

export default function ManualPaymentsPage() {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ManualPayment | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try {
      const res = await api.getAllManualPayments();
      setPayments(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const openReview = (p: ManualPayment) => {
    setSelected(p);
    setAdminNote(p.adminNote || '');
    setReviewModal(true);
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selected) return;
    try {
      await api.reviewManualPayment(selected.id, { status, adminNote });
      toast.success(`Payment ${status.toLowerCase()} successfully`);
      setReviewModal(false);
      loadPayments();
    } catch { toast.error('Failed to review payment'); }
  };

  const filtered = payments.filter(p => {
    const matchesSearch = p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    APPROVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
            <WalletCards className="h-3 w-3" />
            Manual Payments
          </div>
          <h1 className="text-2xl font-bold">Payment Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve or reject manual payment submissions.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-300 text-sm border border-amber-500/20">
          <Clock className="h-4 w-4" />
          {pendingCount} Pending
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by transaction ID or user..." className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-background text-sm focus-visible:ring-2 focus-visible:ring-amber-500/50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm">
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5 bg-white/5">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Plan/Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Method</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Transaction ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3"><div className="text-sm font-medium">{p.user?.name || 'N/A'}</div><div className="text-xs text-muted-foreground">{p.user?.email}</div></td>
                  <td className="px-4 py-3"><div className="text-sm font-medium capitalize">{p.planId}</div><div className="text-xs text-muted-foreground">৳{p.amount.toLocaleString()}</div></td>
                  <td className="px-4 py-3 text-sm">{p.method}</td>
                  <td className="px-4 py-3 text-sm font-mono">{p.transactionId}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${statusColors[p.status]}`}>
                      {p.status === 'PENDING' ? <><Clock className="h-3 w-3" /> Pending</> :
                       p.status === 'APPROVED' ? <><CheckCircle2 className="h-3 w-3" /> Approved</> :
                       <><XCircle className="h-3 w-3" /> Rejected</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openReview(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <Eye className="h-3.5 w-3.5" /> Review
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No payments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>{reviewModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg rounded-2xl border border-white/5 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Review Payment</h3>
              <button onClick={() => setReviewModal(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-white/5 p-3"><span className="text-xs text-muted-foreground block mb-1">User</span><span className="text-sm font-medium">{selected.user?.name}</span><span className="text-xs text-muted-foreground block">{selected.user?.email}</span></div>
              <div className="rounded-xl bg-white/5 p-3"><span className="text-xs text-muted-foreground block mb-1">Status</span><span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${statusColors[selected.status]}`}>{selected.status}</span></div>
              <div className="rounded-xl bg-white/5 p-3"><span className="text-xs text-muted-foreground block mb-1">Plan</span><span className="text-sm font-medium capitalize">{selected.planId}</span><span className="text-xs text-muted-foreground block">৳{selected.amount.toLocaleString()}</span></div>
              <div className="rounded-xl bg-white/5 p-3"><span className="text-xs text-muted-foreground block mb-1">Method</span><span className="text-sm font-medium">{selected.method}</span></div>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-white/5"><span className="text-xs text-muted-foreground block mb-1">Transaction ID</span><span className="text-sm font-mono">{selected.transactionId}</span></div>
            <div className="mb-4"><label className="text-xs font-medium mb-1.5 block text-muted-foreground">Admin Note</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} placeholder="Add a note (shown to user if rejected)..." className="w-full px-3 py-2 rounded-xl border border-white/10 bg-background text-sm resize-none" /></div>
            {selected.status === 'PENDING' ? (
              <div className="flex gap-3">
                <button onClick={() => setReviewModal(false)} className="flex-1 h-11 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5">Cancel</button>
                <button onClick={() => handleReview('REJECTED')} className="flex-1 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20">Reject</button>
                <button onClick={() => handleReview('APPROVED')} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">Approve</button>
              </div>
            ) : (
              <button onClick={() => setReviewModal(false)} className="w-full h-11 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5">Close</button>
            )}
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}