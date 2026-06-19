'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Facebook,
  Package,
  Brain,
  MessageSquare,
  Settings,
  CreditCard,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/connect', label: 'Connect Facebook Page', icon: Facebook },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/ai-instructions', label: 'AI Instructions', icon: Brain },
  { href: '/dashboard/logs', label: 'Message Logs', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Bot Settings', icon: Settings },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm">
              Reply<span className="text-gradient">Mind</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/15 text-purple-300 border border-purple-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapsed hint */}
      {collapsed && (
        <div className="px-3 py-4 border-t border-white/5">
          <div className="text-[10px] text-muted-foreground text-center">Hover to expand</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-card/50 border-r border-white/5 backdrop-blur-xl z-30 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={mobileOpen ? { x: 0 } : { x: '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden fixed left-0 top-0 h-full w-72 bg-card border-r border-white/5 z-50"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
