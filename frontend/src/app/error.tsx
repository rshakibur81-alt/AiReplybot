'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bot } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html>
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/10">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
          <p className="text-muted-foreground mb-2">
            An unexpected error occurred. Our team has been notified.
          </p>
          <p className="text-xs text-muted-foreground/50 mb-8 font-mono bg-white/5 p-2 rounded-lg">
            {error.digest ? `Error ID: ${error.digest}` : error.message?.slice(0, 100)}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </motion.div>
      </body>
    </html>
  );
}