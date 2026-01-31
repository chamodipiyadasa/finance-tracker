'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  Settings,
  Users,
  FolderKanban,
  TrendingUp,
  LogOut,
  Target,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
  { href: '/budget', label: 'Budget', icon: PiggyBank },
  { href: '/savings', label: 'Savings', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { href: '/admin', label: 'Admin Dashboard', icon: TrendingUp },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderKanban },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isAdmin = user?.role === 'Admin';

  // Theme-aware colors
  const colors = {
    sidebarBg: theme === 'light' ? 'bg-[#ECECEC]' : 'bg-dark-900/95',
    border: theme === 'light' ? '#84934A' : 'rgba(233, 223, 158, 0.15)',
    text: theme === 'light' ? '#492828' : '#e9df9e',
    textSecondary: theme === 'light' ? '#656D3F' : '#f9cdd5',
    activeItemBg: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : 'rgba(233, 223, 158, 0.1)',
    hoverBg: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(233, 223, 158, 0.05)',
  };

  return (
    <aside className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 ${colors.sidebarBg} backdrop-blur-xl`} style={{ borderRight: `1px solid ${colors.border}` }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <Image src="/logo.png" alt="Piggy Bank!" width={40} height={40} className="w-10 h-10" />
        <span className="text-2xl" style={{ fontFamily: "'Titan One', cursive", color: theme === 'light' ? '#84934A' : '#e9df9e' }}>Piggy Bank!</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: colors.text }}>
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'border-l-2'
                    : ''
                )}
                style={isActive ? { 
                  background: colors.activeItemBg, 
                  color: colors.text,
                  borderColor: colors.text
                } : {
                  color: colors.textSecondary
                }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-6">
              <p className="px-4 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: colors.text }}>
                Admin
              </p>
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'border-l-2'
                          : ''
                      )}
                      style={isActive ? { 
                        background: colors.activeItemBg, 
                        color: colors.text,
                        borderColor: colors.text
                      } : {
                        color: colors.textSecondary
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium" style={{ background: theme === 'light' ? '#84934A' : 'linear-gradient(135deg, #f9cdd5 0%, #e9df9e 100%)', color: theme === 'light' ? '#FFFFFF' : '#373118' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs truncate" style={{ color: colors.textSecondary }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
          style={{ color: theme === 'light' ? '#492828' : '#f87171' }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
