'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, PiggyBank, Settings, Shield, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
  { href: '/savings', label: 'Savings', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isAdmin = user?.role === 'Admin';

  const items = isAdmin
    ? [...navItems.slice(0, 3), { href: '/admin', label: 'Admin', icon: Shield }]
    : navItems;

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl safe-area-pb"
      style={{ 
        backgroundColor: theme === 'light' ? '#ECECEC' : 'rgba(15, 15, 23, 0.95)',
        borderTop: theme === 'light' ? '1px solid #84934A' : '1px solid rgba(30, 30, 40, 1)'
      }}
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className="flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200"
                style={{ 
                  color: isActive 
                    ? (theme === 'light' ? '#84934A' : '#e9df9e') 
                    : (theme === 'light' ? '#492828' : '#6b7280')
                }}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: theme === 'light' ? '#84934A' : '#e9df9e' }}
                    />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
