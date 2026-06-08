'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Facebook,
  Link2,
  Unlink,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const initialPages = [
  { id: '1', name: 'My Online Store', category: 'Shopping', connected: true, lastSync: '2 min ago' },
  { id: '2', name: 'Tech Reviews BD', category: 'Technology', connected: true, lastSync: '15 min ago' },
  { id: '3', name: 'Fashion Hub', category: 'Clothing', connected: false, lastSync: null },
];

export default function ConnectPage() {
  const [pages, setPages] = useState(initialPages);
  const [connecting, setConnecting] = useState(false);

  const toggleConnection = (pageId: string) => {
    setPages(prev =>
      prev.map(p =>
        p.id === pageId ? { ...p, connected: !p.connected } : p
      )
    );
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6"
      >
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
          <button
            onClick={() => setConnecting(true)}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {connecting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</>
            ) : (
              <><Link2 className="h-4 w-4" /> Connect Page</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Connected Pages List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your Pages</h3>
        {pages.map((page, i) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-white/5 bg-card/50 p-4 flex items-center justify-between group hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                page.connected ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'
              } p-2.5 flex items-center justify-center shadow-lg`}>
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{page.name}</span>
                  {page.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {page.category}
                  {page.connected && page.lastSync && ` • Synced ${page.lastSync}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {page.connected ? (
                <>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleConnection(page.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleConnection(page.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Connect
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Help Text */}
      <div className="rounded-xl border border-white/5 bg-card/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> You need to have a Facebook Page and be an admin of that page to connect it. 
          ReplyMind AI will only access messages and basic page information.
        </p>
      </div>
    </div>
  );
}