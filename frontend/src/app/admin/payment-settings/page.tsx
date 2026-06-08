'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Power,
  PowerOff,
  Copy,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import api from '@/lib/api';

interface PaymentMethod {
  id: string;
  method: string;
  number: string;
  accountType: string;
  isActive: boolean;
  instructions: string;
  usePgwApi: boolean;
}

const methodColors: Record<string, string> = {
  bKash: 'from-pink-600 to-pink-700',
  Nagad: 'from-orange-500 to-orange-600',
  Rocket: 'from-purple-600 to-purple-700',
};

export default function PaymentSettingsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState({ method: 'bKash', number: '', accountType: 'Personal', isActive: true, instructions: '', usePgwApi: false });

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const res = await api.getPaymentMethods();
      setMethods(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ method: 'bKash', number: '', accountType: 'Personal', isActive: true, instructions: '', usePgwApi: false });
    setModalOpen(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setEditing(m);
    setForm({ method: m.method, number: m.number, accountType: m.accountType, isActive: m.isActive, instructions: m.instructions, usePgwApi: m.usePgwApi });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.number.trim()) { toast.error('Number is required'); return; }
    try {
      await api.savePaymentMethod(editing ? { ...form, id: editing.id } : form);
      toast.success(editing ? 'Payment method updated' : 'Payment method added');
      setModalOpen(false);
      loadMethods();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await api.deletePaymentMethod(id);
      toast.success('Deleted');
      loadMethods();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = (m: PaymentMethod) => {
    api.savePaymentMethod({ ...m, id: m.id, isActive: !m.isActive }).then(() => loadMethods()).catch(() => toast.error('Failed to toggle'));
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 mb-3">
            <Landmark className="h-3 w-3" />
            Payment Settings
          </div>
          <h1 className="text-2xl font-bold">Manage Payment Methods</h1>
          <p className="text-sm text-muted-foreground mt-1">Add bKash, Nagad, Rocket numbers for manual payments.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg hover:shadow-amber-500/40 hover:scale-105 transition-all">
          <Plus className="h-4 w-4" /> Add Number
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {methods.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`relative rounded-xl border p-5 transition-all ${m.isActive ? 'border-white/10 bg-card/50' : 'border-white/5 bg-card/20 opacity-60'}`}>
            {!m.isActive && <div className="absolute top-3 right-3"><span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20"><PowerOff className="h-2.5 w-2.5 inline mr-1" />Inactive</span></div>}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${methodColors[m.method] || 'from-gray-500 to-gray-600'} p-3 flex items-center justify-center shadow-lg`}>
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2"><h3 className="text-lg font-bold">{m.method}</h3>{m.isActive && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full"><Power className="h-2 w-2 inline mr-0.5" />Active</span>}</div>
                <p className="text-sm text-muted-foreground">{m.accountType} Account</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-white/5">
              <span className="text-lg font-mono font-bold tracking-wider">{m.number}</span>
              <button onClick={() => { navigator.clipboard.writeText(m.number); toast.success('Copied!'); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"><Copy className="h-4 w-4" /></button>
            </div>
            {m.instructions && <p className="text-xs text-muted-foreground mb-4">{m.instructions}</p>}
            {m.usePgwApi && <div className="mb-3 inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" />bKash PGW API Enabled</div>}
            <div className="flex gap-2 pt-3 border-t border-white/5">
              <button onClick={() => openEdit(m)} className="flex-1 h-9 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/5 flex items-center justify-center gap-1"><Edit2 className="h-3 w-3" /> Edit</button>
              <button onClick={() => toggleActive(m)} className={`flex-1 h-9 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${m.isActive ? 'border border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}>{m.isActive ? <><PowerOff className="h-3 w-3" /> Disable</> : <><Power className="h-3 w-3" /> Enable</>}</button>
              <button onClick={() => handleDelete(m.id)} className="h-9 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20"><Trash2 className="h-3 w-3" /></button>
            </div>
          </motion.div>
        ))}
        {methods.length === 0 && <div className="col-span-2 p-12 text-center text-muted-foreground"><Landmark className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No payment methods added yet. Click "Add Number" to add bKash, Nagad, or Rocket numbers.</p></div>}
      </div>

      <AnimatePresence>{modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md rounded-2xl border border-white/5 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Payment Method</h3><button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs font-medium mb-1.5 block text-muted-foreground">Method</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background text-sm">
                  <option value="bKash">bKash</option><option value="Nagad">Nagad</option><option value="Rocket">Rocket</option>
                </select></div>
              <div><label className="text-xs font-medium mb-1.5 block text-muted-foreground">Number</label>
                <input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="01XXXXXXXXX" className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background text-sm" /></div>
              <div><label className="text-xs font-medium mb-1.5 block text-muted-foreground">Account Type</label>
                <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background text-sm">
                  <option value="Personal">Personal</option><option value="Merchant">Merchant</option><option value="Agent">Agent</option>
                </select></div>
              <div><label className="text-xs font-medium mb-1.5 block text-muted-foreground">Payment Instructions</label>
                <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} rows={2} placeholder="Send money and put your email as reference" className="w-full px-3 py-2 rounded-xl border border-white/10 bg-background text-sm resize-none" /></div>
              {form.method === 'bKash' && <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10"><button onClick={() => setForm({ ...form, usePgwApi: !form.usePgwApi })} className={`relative w-12 h-6 rounded-full transition-colors ${form.usePgwApi ? 'bg-blue-500' : 'bg-gray-600'}`}><motion.div animate={{ x: form.usePgwApi ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" /></button><span className="text-xs text-muted-foreground">Use bKash PGW API (automated)</span></div>}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5"><button onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-600'}`}><motion.div animate={{ x: form.isActive ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" /></button><span className="text-xs text-muted-foreground">Active</span></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="flex-1 h-11 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5">Cancel</button><button onClick={handleSave} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg">{editing ? 'Update' : 'Add Method'}</button></div>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}