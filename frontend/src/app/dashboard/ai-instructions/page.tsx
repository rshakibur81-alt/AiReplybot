'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Save,
  Clock,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AIInstructionsPage() {
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await api.getAIInstruction();

        setInstructions(response.data?.data?.content || '');

        if (response.data?.data?.updatedAt) {
          setLastSaved(
            new Date(response.data.data.updatedAt).toLocaleString()
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await api.saveAIInstruction({
        content: instructions,
      });

      if (response.data?.success) {
        setSaved(true);

        setLastSaved(
          new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            weekday: 'short',
          })
        );

        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to save instructions.'
      );
    } finally {
      setSaving(false);
    }
  };

  const promptExamples = [
    'Always address customers by their name if provided.',
    'Mention ongoing promotions and discount codes.',
    'For complaint messages, apologize first and offer resolution.',
    'Include product recommendations based on customer interest.',
    'Keep responses under 100 words for clarity.',
    'Use emojis sparingly and only when appropriate.',
  ];

  const toggleExample = (example: string) => {
    if (instructions.includes(example)) {
      setInstructions(
        instructions.replace(example, '').trim()
      );
    } else {
      setInstructions(
        instructions +
          (instructions ? '\n' : '') +
          example
      );
    }
  };

 if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="h-8 w-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
      />
    </div>
  );

  return (
  <div className="space-y-6 max-w-3xl">

{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
  >
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    {error}
  </motion.div>
)}

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-xl border border-white/5 bg-card/50 p-6"
>
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 p-2 flex items-center justify-center shadow-lg">
      <Brain className="h-5 w-5 text-white" />
    </div>

    <div>
      <h3 className="font-semibold">Custom Instructions</h3>
      <p className="text-xs text-muted-foreground">
        These instructions guide the AI when generating replies
      </p>
    </div>
  </div>

  <textarea
    value={instructions}
    onChange={(e) => setInstructions(e.target.value)}
    placeholder="Write your AI instructions here..."
    className="w-full min-h-[220px] p-4 rounded-xl border border-white/10 bg-background text-sm resize-y"
  />

  <div className="flex items-center justify-between mt-4">
    {lastSaved && (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        Last saved: {lastSaved}
      </div>
    )}

    <div className="flex items-center gap-3 ml-auto">
      {saved && (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <Check className="h-3 w-3" />
          Saved!
        </span>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Instructions'}
      </button>
    </div>
  </div>
</motion.div>

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-xl border border-white/5 bg-card/50 p-6"
>
  <div className="flex items-center gap-2 mb-4">
    <Sparkles className="h-4 w-4 text-purple-400" />
    <h3 className="font-semibold text-sm">
      Quick-add prompt examples
    </h3>
  </div>

  <div className="flex flex-wrap gap-2">
    {promptExamples.map((example) => (
      <button
        key={example}
        onClick={() => toggleExample(example)}
        className="px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:border-white/20"
      >
        + {example.slice(0, 50)}...
      </button>
    ))}
  </div>
</motion.div>

<div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">
  <p className="text-xs text-purple-300">
    <strong className="text-purple-200">💡 Tip:</strong>
    Be specific about your business rules, pricing, and tone
    preferences. The more context you provide, the more accurate
    and helpful the AI replies will be.
  </p>
</div>
  );
}
