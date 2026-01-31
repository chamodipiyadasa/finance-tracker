'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Edit2, Plus, Target, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { Budget, CreateBudgetRequest } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BudgetPage() {
  const { theme } = useTheme();
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const [currentResponse, allResponse] = await Promise.all([
        api.getCurrentBudget(),
        api.getAllBudgets(),
      ]);

      if (currentResponse.success && currentResponse.data) {
        setCurrentBudget(currentResponse.data);
      }
      if (allResponse.success && allResponse.data) {
        setAllBudgets(allResponse.data);
      }
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budgetAmount) return;

    setIsSubmitting(true);
    try {
      const response = await api.createOrUpdateBudget({
        amount: parseFloat(budgetAmount),
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success && response.data) {
        toast.success('Budget saved successfully');
        await loadBudgets();
        setShowForm(false);
        setBudgetAmount('');
      }
    } catch (error) {
      toast.error('Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rs ' + new Intl.NumberFormat('en-LK', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-accent-500';
      case 'Warning': return 'bg-warning-500';
      case 'Danger': return 'bg-danger-500';
      default: return 'bg-dark-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Good': return 'text-accent-400';
      case 'Warning': return 'text-warning-400';
      case 'Danger': return 'text-danger-400';
      default: return 'text-dark-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 skeleton w-48" />
        <div className="h-48 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>Budget</h1>
          <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Manage your monthly budgets and track spending</p>
        </div>
        <button
          onClick={() => {
            setBudgetAmount(currentBudget?.amount.toString() || '');
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          {currentBudget ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {currentBudget ? 'Edit Budget' : 'Set Budget'}
        </button>
      </div>

      {/* Current Month Budget */}
      {currentBudget ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : undefined }}>
              <Target className="w-8 h-8" style={{ color: theme === 'light' ? '#84934A' : undefined }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                {months[new Date().getMonth()]} Budget
              </h2>
              <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Your spending goal for this month</p>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="text-center sm:text-left">
              <p className="text-sm mb-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Budget</p>
              <p className="text-3xl font-bold font-tabular" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                {formatCurrency(currentBudget.amount)}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm mb-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Spent</p>
              <p className={clsx('text-3xl font-bold font-tabular', getStatusTextColor(currentBudget.status))}>
                {formatCurrency(currentBudget.spent)}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm mb-1" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Remaining</p>
              <p className={clsx(
                'text-3xl font-bold font-tabular',
                currentBudget.remaining >= 0 ? 'text-accent-400' : 'text-danger-400'
              )}>
                {formatCurrency(Math.abs(currentBudget.remaining))}
                {currentBudget.remaining < 0 && <span className="text-lg"> over</span>}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Progress</span>
              <span className={getStatusTextColor(currentBudget.status)}>
                {currentBudget.percentageUsed.toFixed(1)}%
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : undefined }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(currentBudget.percentageUsed, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={clsx('h-full rounded-full', getStatusColor(currentBudget.status))}
              />
            </div>
            {currentBudget.percentageUsed > 100 && (
              <p className="text-sm text-danger-400 text-right">
                Over budget by {formatCurrency(Math.abs(currentBudget.remaining))}
              </p>
            )}
          </div>

          {/* Motivational Tips */}
          <div className="mt-6 p-4 rounded-xl" style={{
            backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(30, 30, 40, 0.5)',
            border: theme === 'light' ? '1px solid #84934A' : '1px solid rgba(233, 223, 158, 0.2)'
          }}>
            {currentBudget.status === 'Good' && (
              <div className="flex items-center gap-3 text-accent-400">
                <TrendingDown className="w-5 h-5" />
                <p>Great job! You're well within your budget. Keep it up! 🎉</p>
              </div>
            )}
            {currentBudget.status === 'Warning' && (
              <div className="flex items-center gap-3 text-warning-400">
                <TrendingUp className="w-5 h-5" />
                <p>You're approaching your limit. Consider reducing non-essential spending.</p>
              </div>
            )}
            {currentBudget.status === 'Danger' && (
              <div className="flex items-center gap-3 text-danger-400">
                <TrendingUp className="w-5 h-5" />
                <p>Budget exceeded! Review your expenses and adjust for next month.</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <PiggyBank className="w-16 h-16 mx-auto mb-4" style={{ color: theme === 'light' ? '#84934A' : undefined }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme === 'light' ? '#492828' : undefined }}>No Budget Set</h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
            Set a monthly budget to track your spending and stay on top of your finances.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Set Your First Budget
          </button>
        </motion.div>
      )}

      {/* Budget History */}
      {allBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme === 'light' ? '#492828' : undefined }}>Budget History</h3>
          <div className="space-y-3">
            {allBudgets
              .sort((a, b) => b.year - a.year || b.month - a.month)
              .slice(0, 6)
              .map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: theme === 'light' ? '1px solid rgba(132, 147, 74, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                      {months[budget.month - 1]} {budget.year}
                    </p>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                      Budget: {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={clsx('font-semibold', getStatusTextColor(budget.status))}>
                      {formatCurrency(budget.spent)}
                    </p>
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full',
                      budget.status === 'Good' && 'bg-accent-500/20 text-accent-400',
                      budget.status === 'Warning' && 'bg-warning-500/20 text-warning-400',
                      budget.status === 'Danger' && 'bg-danger-500/20 text-danger-400'
                    )}>
                      {budget.percentageUsed.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-6" style={{ color: theme === 'light' ? '#492828' : undefined }}>
              {currentBudget ? 'Edit Budget' : 'Set Budget'}
            </h2>
            <form onSubmit={handleSaveBudget} className="space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                  Budget Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 text-lg font-semibold">
                    Rs
                  </span>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="50000"
                    min="1"
                    required
                    className="input-field pl-10 text-xl font-semibold"
                  />
                </div>
              </div>

              {/* Month & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !budgetAmount}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
