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
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">
        AI Instructions
      </h1>

      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      <textarea
        value={instructions}
        onChange={(e) =>
          setInstructions(e.target.value)
        }
        className="w-full min-h-[250px] border rounded-lg p-4"
      />

      <div className="flex gap-2 flex-wrap">
        {promptExamples.map((example) => (
          <button
            key={example}
            onClick={() =>
              toggleExample(example)
            }
            className="border rounded px-2 py-1"
          >
            {example}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      {saved && (
        <div className="text-green-500">
          Saved successfully
        </div>
      )}

      {lastSaved && (
        <div className="text-sm text-gray-500">
          Last saved: {lastSaved}
        </div>
      )}
    </div>
  );
}
