'use client';

import { motion } from 'framer-motion';
import { Budget } from '@/types';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

interface BudgetProgressProps {
  budget: Budget;
  currency: string;
}

export default function BudgetProgress({ budget, currency }: BudgetProgressProps) {
  const { theme } = useTheme();
  const progressColor = {
    Good: 'bg-accent-500',
    Warning: 'bg-warning-500',
    Danger: 'bg-danger-500',
  };

  const textColor = {
    Good: 'text-accent-400',
    Warning: 'text-warning-400',
    Danger: 'text-danger-400',
  };

  const formatCurrency = (amount: number) => {
    return 'Rs ' + new Intl.NumberFormat('en-LK', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>Monthly Budget</h3>
        <span className={clsx('badge', {
          'badge-success': budget.status === 'Good',
          'badge-warning': budget.status === 'Warning',
          'badge-danger': budget.status === 'Danger',
        })}>
          {budget.percentageUsed.toFixed(0)}% used
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="progress-bar h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={clsx('progress-fill', progressColor[budget.status])}
          />
        </div>
        {/* Overflow indicator */}
        {budget.percentageUsed > 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 top-0 -mt-1 px-2 py-0.5 bg-danger-500 rounded text-xs text-white"
          >
            +{(budget.percentageUsed - 100).toFixed(0)}% over
          </motion.div>
        )}
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm mb-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Budget</p>
          <p className="text-lg font-semibold font-tabular" style={{ color: theme === 'light' ? '#492828' : undefined }}>
            {formatCurrency(budget.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Spent</p>
          <p className={clsx('text-lg font-semibold font-tabular', textColor[budget.status])}>
            {formatCurrency(budget.spent)}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Remaining</p>
          <p className={clsx(
            'text-lg font-semibold font-tabular',
            budget.remaining >= 0 ? 'text-accent-400' : 'text-danger-400'
          )}>
            {formatCurrency(Math.abs(budget.remaining))}
            {budget.remaining < 0 && ' over'}
          </p>
        </div>
      </div>
    </div>
  );
}
