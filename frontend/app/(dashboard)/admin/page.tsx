'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Wallet, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '@/services/api';
import { Category } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalExpenses: number;
  totalAmount: number;
  averagePerUser: number;
  categoryBreakdown: { categoryName: string; total: number; count: number }[];
}

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, categoriesResponse] = await Promise.all([
        api.getAdminStats(),
        api.getCategories(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rs ' + new Intl.NumberFormat('en-LK', {
      maximumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 skeleton w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
        <div className="h-64 skeleton" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      subtitle: `${stats?.activeUsers || 0} active`,
      icon: Users,
      color: 'primary',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Expenses',
      value: stats?.totalExpenses || 0,
      subtitle: 'All transactions',
      icon: Wallet,
      color: 'accent',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats?.totalAmount || 0),
      subtitle: 'All time spending',
      icon: TrendingUp,
      color: 'warning',
      trend: '+23%',
      trendUp: false,
    },
    {
      title: 'Avg Per User',
      value: formatCurrency(stats?.averagePerUser || 0),
      subtitle: 'Monthly average',
      icon: PieChart,
      color: 'danger',
      trend: '-5%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme === 'light' ? '#492828' : 'white' }}>Admin Dashboard</h1>
        <p style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>System overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? 'text-accent-400' : 'text-danger-400'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <p className="text-2xl font-bold font-tabular" style={{ color: theme === 'light' ? '#492828' : 'white' }}>{stat.value}</p>
            <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Category Spending Overview</h2>
        
        {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
          <div className="space-y-4">
            {stats.categoryBreakdown
              .sort((a, b) => b.total - a.total)
              .map((cat, index) => {
                const maxTotal = Math.max(...stats.categoryBreakdown.map(c => c.total));
                const percentage = (cat.total / maxTotal) * 100;
                
                return (
                  <motion.div
                    key={cat.categoryName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(cat.categoryName) }}
                        />
                        <span className="font-medium" style={{ color: theme === 'light' ? '#492828' : 'white' }}>{cat.categoryName}</span>
                        <span className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>({cat.count} transactions)</span>
                      </div>
                      <span className="font-tabular font-semibold" style={{ color: theme === 'light' ? '#492828' : 'white' }}>
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : '#374151' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: getCategoryColor(cat.categoryName) }}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p style={{ color: theme === 'light' ? '#656D3F' : '#6b7280' }}>No expense data available</p>
          </div>
        )}
      </motion.div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.a
          href="/admin/users"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 group hover:border-primary-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
              <Users className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                Manage Users
              </h3>
              <p className="text-sm text-dark-400">View and manage user accounts</p>
            </div>
          </div>
        </motion.a>

        <motion.a
          href="/admin/categories"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 group hover:border-accent-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
              <PieChart className="w-7 h-7 text-accent-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors">
                Manage Categories
              </h3>
              <p className="text-sm text-dark-400">Configure expense categories</p>
            </div>
          </div>
        </motion.a>
      </div>
    </div>
  );
}
