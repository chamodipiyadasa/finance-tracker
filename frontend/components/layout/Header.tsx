'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, ChevronDown, LogOut, Settings, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl ${theme === 'light' ? 'bg-[#ECECEC]' : 'bg-dark-900/80'}`} style={{ borderBottom: theme === 'light' ? '1px solid #84934A' : '1px solid rgba(233, 223, 158, 0.15)' }}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 transition-colors"
            style={{ color: '#f9cdd5' }}
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ color: theme === 'light' ? '#492828' : '#e9df9e' }}>{currentMonth}</span>
            <span className="text-lg" style={{ color: theme === 'light' ? '#84934A' : '#f9cdd5' }}>{currentYear}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
            style={{ 
              background: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(233, 223, 158, 0.1)',
              color: theme === 'light' ? '#84934A' : '#e9df9e'
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 transition-colors" style={{ color: theme === 'light' ? '#656D3F' : '#f9cdd5' }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: theme === 'light' ? '#84934A' : '#e9df9e' }} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-base-300/10"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: theme === 'light' ? '#84934A' : 'linear-gradient(135deg, #f9cdd5 0%, #e9df9e 100%)', color: theme === 'light' ? '#FFFFFF' : '#373118' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="hidden sm:block text-sm font-medium" style={{ color: theme === 'light' ? '#492828' : '#e9df9e' }}>
                {user?.firstName}
              </span>
              <ChevronDown className="hidden sm:block w-4 h-4" style={{ color: theme === 'light' ? '#656D3F' : '#a8a29e' }} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 glass-card py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-primary-300/20">
                    <p className="text-sm font-medium text-base-200">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-base-400">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary-300/20 text-primary-300">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-base-300 hover:text-primary-300 hover:bg-primary-300/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-base-300 hover:text-primary-300 hover:bg-primary-300/10 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-primary-300/20 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-danger-400 hover:bg-danger-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
