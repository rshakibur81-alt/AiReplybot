'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Save, Clock, Check, Sparkles } from 'lucide-react';

export default function AIInstructionsPage() {
  const [instructions, setInstructions] = useState(
    'Delivery charge inside Dhaka ৳60, outside ৳120. No return policy. Always address customers formally. Offer discounts for bulk orders. Respond in Bangla if customer messages in Bangla.'
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>('Today at 2:30 PM');

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setLastSaved(new Date().toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true,
      weekday: 'short',
    }));
    setTimeout(() => setSaved(false), 3000);
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
    const current = instructions;
    if (current.includes(example)) {
      setInstructions(current.replace(example, '').replace(/\n\n+/g, '\n').trim());
    } else {
      setInstructions(current + (current ? '\n' : '') + example);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">AI Instructions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define how your AI should respond to customer messages.
        </p>
      </div>

      {/* Instruction Editor */}
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
          placeholder="Example: Delivery charge inside Dhaka ৳60, outside ৳120. No return policy. Always address customers formally."
          className="w-full min-h-[200px] p-4 rounded-xl border border-white/10 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 resize-y"
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
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-xs text-green-400"
              >
                <Check className="h-3 w-3" />
                Saved!
              </motion.span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Instructions</>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/5 bg-card/50 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h3 className="font-semibold text-sm">Quick-add prompt examples</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {promptExamples.map((example) => {
            const isActive = instructions.includes(example);
            return (
              <button
                key={example}
                onClick={() => toggleExample(example)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  isActive
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                    : 'border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
                }`}
              >
                {isActive ? '✓ ' : '+ '}{example.slice(0, 50)}...
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tips */}
      <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">
        <p className="text-xs text-purple-300">
          <strong className="text-purple-200">💡 Tip:</strong> Be specific about your business rules, pricing, 
          and tone preferences. The more context you provide, the more accurate and helpful the AI replies will be.
        </p>
      </div>
    </div>
  );
}