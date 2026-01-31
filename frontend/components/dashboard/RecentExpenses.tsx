'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '@/services/api';
import { Expense } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface RecentExpensesProps {
  currency: string;
}

export default function RecentExpenses({ currency }: RecentExpensesProps) {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await api.getExpenses({ pageSize: 5 });
      if (response.success && response.data) {
        setExpenses(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      Food: '#FF6B6B',
      Transport: '#4ECDC4',
      Bills: '#45B7D1',
      Shopping: '#96CEB4',
      Investment: '#FFEAA7',
      Entertainment: '#DDA0DD',
      Healthcare: '#FF9FF3',
      Education: '#54A0FF',
      Others: '#A0A0A0',
    };
    return colors[categoryName] || '#A0A0A0';
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 skeleton" />
          <div className="h-8 w-24 skeleton" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>Recent Expenses</h3>
        <Link href="/expenses">
          <motion.button
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: theme === 'light' ? '#84934A' : undefined }}
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="py-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: theme === 'light' ? '#656D3F' : undefined }} />
          <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>No expenses yet</p>
          <Link href="/expenses">
            <button className="mt-4 btn-primary text-sm">Add your first expense</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl transition-colors"
              style={{ backgroundColor: theme === 'light' ? 'transparent' : undefined }}
            >
              {/* Category indicator */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor(expense.categoryName)}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(expense.categoryName) }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {expense.notes || expense.categoryName}
                </p>
                <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                  {expense.categoryName} • {format(parseISO(expense.date), 'MMM d')}
                </p>
              </div>

              {/* Amount */}
              <p className="text-lg font-semibold font-tabular" style={{ color: theme === 'light' ? '#84934A' : undefined }}>
                Rs {expense.amount.toLocaleString('en-LK')}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
