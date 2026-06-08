'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Users,
  CreditCard,
  FileCode2,
  Landmark,
  WalletCards,
  LogOut,
  ChevronDown,
  Menu,
  Bot,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const adminMenuItems = [
  { href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/plans', label: 'Subscription Plans', icon: CreditCard },
  { href: '/admin/payment-settings', label: 'Payment Settings', icon: Landmark },
  { href: '/admin/manual-payments', label: 'Manual Payments', icon: WalletCards },
  { href: '/admin/api-logs', label: 'API Logs', icon: FileCode2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    console.log('[Admin Layout] Session status:', status);
    console.log('[Admin Layout] Session user:', session?.user);
    console.log('[Admin Layout] User role:', (session?.user as any)?.role);
    console.log('[Admin Layout] Is ADMIN?', (session?.user as any)?.role === 'ADMIN');

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto shadow-xl shadow-purple-500/10" />
          <p className="mt-4 text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') return null;

  const userInitials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user?.email?.[0].toUpperCase() || 'A';

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-sm">
              Admin<span className="text-gradient">Panel</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/15 to-purple-500/15 text-amber-300 border border-amber-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="px-3 pb-4 border-t border-white/5 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Bot className="h-4 w-4" />
          {!sidebarCollapsed && <span>User Dashboard</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
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

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center lg:hidden">
                <Shield className="h-4 w-4 text-amber-400" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Admin badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/20">
                <Shield className="h-3 w-3" />
                Super Admin
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <>
                    <div onClick={() => setUserMenuOpen(false)} className="fixed inset-0 z-10" />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/5 bg-card shadow-2xl z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium truncate">{session.user?.name || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}