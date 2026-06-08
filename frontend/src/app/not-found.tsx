import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-white/5">
          <Bot className="h-12 w-12 text-purple-400" />
        </div>
        <h1 className="text-6xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Page not found</p>
        <p className="text-sm text-muted-foreground/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}