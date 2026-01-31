'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  status?: 'Good' | 'Warning' | 'Danger';
  delay?: number;
}

export default function StatCard({ title, value, icon: Icon, trend, status, delay = 0 }: StatCardProps) {
  const { theme } = useTheme();
  const isPositiveTrend = trend !== undefined && trend < 0; // Spending less is positive
  const showTrend = trend !== undefined && trend !== 0;

  const statusColors = {
    Good: 'text-accent-400 bg-accent-500/10',
    Warning: 'text-warning-400 bg-warning-500/10',
    Danger: 'text-danger-400 bg-danger-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center" 
          style={{ 
            background: theme === 'light' 
              ? 'rgba(132, 147, 74, 0.2)' 
              : 'linear-gradient(135deg, rgba(233, 223, 158, 0.2) 0%, rgba(249, 205, 213, 0.15) 100%)' 
          }}
        >
          <Icon className="w-5 h-5" style={{ color: theme === 'light' ? '#84934A' : '#d4c896' }} />
        </div>
        {showTrend && (
          <div
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              isPositiveTrend ? 'bg-accent-500/20 text-accent-400' : 'bg-danger-500/20 text-danger-400'
            )}
          >
            {isPositiveTrend ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
        {status && (
          <span className={clsx('px-2 py-1 rounded-lg text-xs font-medium', statusColors[status])}>
            {status}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-tabular" style={{ color: theme === 'light' ? '#492828' : '#e9df9e' }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: theme === 'light' ? '#656D3F' : '#f9cdd5' }}>{title}</p>
    </motion.div>
  );
}
