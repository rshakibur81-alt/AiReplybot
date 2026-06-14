'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, ToggleLeft, ToggleRight, Save, Clock, MessageSquare, Check, Bot, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function BotSettingsPage() {
  const [autoReply, setAutoReply] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState(
    'Thank you for your message! We have received your query and will get back to you shortly.'
  );
  const [responseDelay, setResponseDelay] = useState('instant');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await api.getBotSettings();
        const data = response.data.data;
        setAutoReply(data.isActive);
        setResponseDelay(data.responseDelay);
        setFallbackMessage(data.fallbackMessage);
        setError('');
      } catch (err: any) {
        console.error('[BotSettings] Failed to load:', err);
        setError('Failed to load settings from server');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await api.updateBotSettings({
        isActive: autoReply,
        responseDelay,
        fallbackMessage,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('[BotSettings] Failed to save:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Bot Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how your AI bot behaves and responds to customers.
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-8 w-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
          />
          <span className="ml-3 text-sm text-muted-foreground">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Bot Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how your AI bot behaves and responds to customers.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Auto-Reply Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-card/50 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${autoReply ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-gray-500 to-gray-600'} p-3 flex items-center justify-center shadow-lg transition-colors`}>
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Auto-Reply</h3>
              <p className="text-sm text-muted-foreground">
                {autoReply ? 'Bot is active and responding to messages' : 'Bot is paused'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAutoReply(!autoReply)}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
              autoReply ? 'bg-purple-500' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: autoReply ? 32 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
            />
          </button>
        </div>
      </motion.div>

      {/* Fallback Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/5 bg-card/50 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2 flex items-center justify-center shadow-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Fallback Message</h3>
            <p className="text-xs text-muted-foreground">
              Sent when AI cannot generate a response or no rule matches
            </p>
          </div>
        </div>
        <textarea
          value={fallbackMessage}
          onChange={(e) => setFallbackMessage(e.target.value)}
          rows={3}
          className="w-full p-4 rounded-xl border border-white/10 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 resize-none"
        />
      </motion.div>

      {/* Response Delay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/5 bg-card/50 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2 flex items-center justify-center shadow-lg">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Response Delay</h3>
            <p className="text-xs text-muted-foreground">
              Simulate human-like response timing for a natural feel
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'instant', label: 'Instant', desc: 'No delay' },
            { value: 'short', label: '1-3 Seconds', desc: 'Quick human feel' },
            { value: 'medium', label: '3-5 Seconds', desc: 'Natural pace' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setResponseDelay(option.value)}
              className={`p-4 rounded-xl border text-center transition-all ${
                responseDelay === option.value
                  ? 'border-purple-500/30 bg-purple-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`text-xl font-bold mb-1 ${
                responseDelay === option.value ? 'text-purple-300' : 'text-muted-foreground'
              }`}>
                {option.label}
              </div>
              <div className="text-xs text-muted-foreground">{option.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end">
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-xs text-green-400 mr-3 self-center"
          >
            <Check className="h-3 w-3" />
            Settings saved!
          </motion.span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> Save Settings</>
          )}
        </button>
      </div>
    </div>
  );
}