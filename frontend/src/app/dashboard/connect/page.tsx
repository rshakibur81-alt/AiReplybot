'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Facebook, Link2, Unlink, CheckCircle2, XCircle,
  Loader2, RefreshCw, Plus, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ConnectPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const [form, setForm] = useState({
    pageId: '',
    pageName: '',
    pageCategory: '',
    pageAccessToken: '',
    pageImageUrl: '',
  });

  const fetchPages = async () => {
    try {
      const res = await api.getPages();
      if (res.data.success) setPages(res.data.data || []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const handleConnect = async () => {
    if (!form.pageId || !form.pageName || !form.pageAccessToken) {
      toast.error('Page ID, Name এবং Access Token দিন');
      return;
    }
    setSubmitting(true);
    try {
      await api.connectPage(form);
      toast.success('Facebook page connected!');
      setShowForm(false);
      setForm({ pageId: '', pageName: '', pageCategory: '', pageAccessToken: '', pageImageUrl: '' });
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to connect page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (pageId: string) => {
    if (!confirm('এই page disconnect করবেন?')) return;
    setDisconnecting(pageId);
    try {
      await api.removePage(pageId);
      toast.success('Page disconnected');
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connect Facebook Page</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Link your Facebook pages to start auto-replying to messages.
        </p>
      </div>

      {/* Connect Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Facebook className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Connect a New Facebook Page</h3>
            <p className="text-sm text-muted-foreground">
              Authorize ReplyMind AI to access your Facebook pages and manage messages.
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
            <Plus className="h-4 w-4" /> Connect Page
          </button>
        </div>
      </motion.div>

      {/* Connect Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-4">
          <h3 className="font-semibold">Page Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Page ID *</label>
              <input value={form.pageId} onChange={e => setForm({ ...form, pageId: e.target.value })}
                placeholder="1234567890"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Page Name *</label>
              <input value={form.pageName} onChange={e => setForm({ ...form, pageName: e.target.value })}
                placeholder="My Facebook Page"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
              <input value={form.pageCategory} onChange={e => setForm({ ...form, pageCategory: e.target.value })}
                placeholder="Shopping, Technology..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Page Image URL</label>
              <input value={form.pageImageUrl} onChange={e => setForm({ ...form, pageImageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Page Access Token *</label>
            <input value={form.pageAccessToken} onChange={e => setForm({ ...form, pageAccessToken: e.target.value })}
              placeholder="EAAxxxxxxxx..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Facebook Developer Console থেকে Page Access Token নিন। Page এর Admin হতে হবে।
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleConnect} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-all">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</> : <><Link2 className="h-4 w-4" /> Connect Page</>}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Pages List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your Pages</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-xl border border-white/5 bg-card/50 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-white/5 rounded" />
                    <div className="h-2 w-20 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-card/50 p-8 text-center">
            <Facebook className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">কোনো page connect করা নেই</p>
            <p className="text-xs text-muted-foreground/50 mt-1">উপরের "Connect Page" button এ click করুন</p>
          </div>
        ) : (
          pages.map((page, i) => (
            <motion.div key={page.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/5 bg-card/50 p-4 flex items-center justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${page.isConnected ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'} p-2.5 flex items-center justify-center`}>
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{page.pageName}</span>
                    {page.isConnected ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {page.pageCategory || 'Facebook Page'} • {new Date(page.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchPages} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={() => handleDisconnect(page.id)} disabled={disconnecting === page.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                  {disconnecting === page.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                  Disconnect
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-white/5 bg-card/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> You need to have a Facebook Page and be an admin of that page to connect it. ReplyMind AI will only access messages and basic page information.
        </p>
      </div>
    </div>
  );
}
