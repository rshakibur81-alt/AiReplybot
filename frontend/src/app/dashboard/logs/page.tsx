'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarRange,
  Bot,
  User,
  Clock,
} from 'lucide-react';

interface LogEntry {
  id: string;
  customer: string;
  message: string;
  aiReply: string;
  time: string;
  status: 'success' | 'failed' | 'pending';
}

const allLogs: LogEntry[] = [
  { id: '1', customer: 'Rahim Miah', message: 'Do you have any discounts available?', aiReply: 'Yes! We have a 20% discount on your first order with code WELCOME20.', time: '2 min ago', status: 'success' },
  { id: '2', customer: 'Fatima Begum', message: 'How much is delivery charge?', aiReply: 'Delivery inside Dhaka is ৳60 and outside Dhaka is ৳120.', time: '15 min ago', status: 'success' },
  { id: '3', customer: 'Kabir Hossain', message: 'I want to return my order', aiReply: 'I apologize for the inconvenience. Please share your order number and I will assist you.', time: '1 hour ago', status: 'success' },
  { id: '4', customer: 'Nusrat Jahan', message: 'Is the blue dress available in size M?', aiReply: 'Let me check that for you... Yes, the blue summer dress is available in size M!', time: '2 hours ago', status: 'success' },
  { id: '5', customer: 'Hasan Ali', message: 'Do you ship to Chittagong?', aiReply: 'Yes, we deliver nationwide. Delivery to Chittagong takes 2-3 business days.', time: '3 hours ago', status: 'success' },
  { id: '6', customer: 'Shamim Reza', message: 'What is your return policy?', aiReply: 'Our return policy allows returns within 7 days of delivery. Please check our policy page for details.', time: '5 hours ago', status: 'success' },
  { id: '7', customer: 'Ayesha Khatun', message: 'Hello, are you open tomorrow?', aiReply: 'Hi! Yes, we are open from 10 AM to 8 PM tomorrow.', time: '6 hours ago', status: 'success' },
  { id: '8', customer: 'Abdur Rahman', message: 'I want to cancel my order #1234', aiReply: 'I understand you want to cancel order #1234. Let me process that for you.', time: '8 hours ago', status: 'failed' },
];

const ITEMS_PER_PAGE = 5;

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = allLogs.filter(log => {
    const matchesSearch = log.customer.toLowerCase().includes(search.toLowerCase()) ||
                          log.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Message Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review all customer messages and AI responses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name or message..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Message</th>
                <th className="text-left hidden lg:table-cell px-4 py-3 text-xs font-medium text-muted-foreground">AI Reply</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-sm font-medium">{log.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{log.message}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground max-w-[250px] truncate">
                    <div className="flex items-center gap-1.5">
                      <Bot className="h-3 w-3 text-blue-400 flex-shrink-0" />
                      {log.aiReply}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.time}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        ✓ Success
                      </span>
                    ) : log.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        ✗ Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        ● Pending
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} logs
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === i + 1
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}