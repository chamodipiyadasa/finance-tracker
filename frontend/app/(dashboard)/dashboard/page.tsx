'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '@/services/api';
import { DashboardSummary } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryDonut from '@/components/charts/CategoryDonut';
import DailyBarChart from '@/components/charts/DailyBarChart';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import StatCard from '@/components/dashboard/StatCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

  // Get current month/year from frontend to ensure consistency
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadDashboard();
  }, [currentMonth, currentYear]);

  const loadDashboard = async () => {
    try {
      // Pass current month/year explicitly to ensure accurate calculations
      const response = await api.getDashboard(currentMonth, currentYear);
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rs ' + new Intl.NumberFormat('en-LK', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: theme === 'light' ? '#492828' : '#e9df9e' }}>
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-1" style={{ color: theme === 'light' ? '#656D3F' : '#f9cdd5' }}>
            Here&apos;s what&apos;s happening with your finances
          </p>
        </div>
      </motion.div>

      {/* Motivational Message */}
      {dashboard?.motivationalMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
          style={{ borderLeft: theme === 'light' ? '4px solid #84934A' : '4px solid #e9df9e' }}
        >
          <p style={{ color: theme === 'light' ? '#492828' : '#f9cdd5' }}>{dashboard.motivationalMessage}</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spent"
          value={formatCurrency(dashboard?.totalSpentThisMonth || 0)}
          icon={Wallet}
          trend={dashboard?.percentageChange || 0}
          delay={0.1}
        />
        <StatCard
          title="Transactions"
          value={dashboard?.transactionCount?.toString() || '0'}
          icon={Calendar}
          delay={0.2}
        />
        <StatCard
          title="Daily Average"
          value={formatCurrency(dashboard?.averagePerDay || 0)}
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          title="Budget Status"
          value={dashboard?.currentBudget?.status || 'Not Set'}
          icon={Target}
          status={dashboard?.currentBudget?.status}
          delay={0.4}
        />
      </div>

      {/* Budget Progress */}
      {dashboard?.currentBudget && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <BudgetProgress budget={dashboard.currentBudget} currency={user?.currency || 'Rs'} />
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <SpendingChart data={dashboard?.monthlyTrend || []} currency={user?.currency || 'Rs'} />
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <CategoryDonut data={dashboard?.topCategories || []} currency={user?.currency || 'Rs'} />
        </motion.div>
      </div>

      {/* Daily Spending */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <DailyBarChart data={dashboard?.dailySpending || []} currency={user?.currency || 'Rs'} />
      </motion.div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <RecentExpenses currency={user?.currency || 'Rs'} />
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 skeleton w-1/2" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 skeleton" />
        ))}
      </div>
      <div className="h-24 skeleton" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 skeleton" />
        <div className="h-80 skeleton" />
      </div>
    </div>
  );
}
