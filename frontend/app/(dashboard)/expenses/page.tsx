'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, X, Calendar, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { Expense, Category, PaginatedResponse, CreateExpenseRequest } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import ExpenseModal from '@/components/expenses/ExpenseModal';
import { useTheme } from '@/contexts/ThemeContext';

export default function ExpensesPage() {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [selectedCategory, page]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadExpenses = async (reset = false) => {
    try {
      if (reset) setPage(1);
      
      const response = await api.getExpenses({
        categoryId: selectedCategory || undefined,
        page: reset ? 1 : page,
        pageSize: 20,
      });
      
      if (response.success && response.data) {
        if (reset || page === 1) {
          setExpenses(response.data.items);
        } else {
          setExpenses(prev => [...prev, ...response.data!.items]);
        }
        setTotalCount(response.data.totalCount);
        setHasMore(response.data.hasNextPage);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await api.deleteExpense(id);
      if (response.success) {
        toast.success('Expense deleted');
        setExpenses(prev => prev.filter(e => e.id !== id));
        setTotalCount(prev => prev - 1);
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleSaveExpense = async (data: CreateExpenseRequest) => {
    try {
      if (editingExpense) {
        const response = await api.updateExpense(editingExpense.id, data);
        if (response.success && response.data) {
          setExpenses(prev => prev.map(e => e.id === editingExpense.id ? response.data! : e));
          toast.success('Expense updated');
        }
      } else {
        const response = await api.createExpense(data);
        if (response.success && response.data) {
          setExpenses(prev => [response.data!, ...prev]);
          setTotalCount(prev => prev + 1);
          toast.success('Expense added');
        }
      }
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#A0A0A0';
  };

  const filteredExpenses = expenses.filter(expense => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      expense.notes?.toLowerCase().includes(query) ||
      expense.categoryName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>Expenses</h1>
          <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>{totalCount} transactions</p>
        </div>
        <button onClick={handleAddExpense} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme === 'light' ? '#656D3F' : undefined }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="input-field pl-10"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="input-field sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Receipt className="w-16 h-16 mx-auto mb-4" style={{ color: theme === 'light' ? '#656D3F' : undefined }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme === 'light' ? '#492828' : undefined }}>No expenses found</h3>
          <p className="mb-6" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
            {searchQuery || selectedCategory
              ? 'Try adjusting your filters'
              : 'Start tracking your expenses by adding your first one'}
          </p>
          <button onClick={handleAddExpense} className="btn-primary">
            Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center gap-4">
                {/* Category Color */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${getCategoryColor(expense.categoryName)}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getCategoryColor(expense.categoryName) }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                    {expense.notes || expense.categoryName}
                  </p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    <span
                      className="px-2 py-0.5 rounded-md text-xs"
                      style={{
                        backgroundColor: `${getCategoryColor(expense.categoryName)}20`,
                        color: getCategoryColor(expense.categoryName),
                      }}
                    >
                      {expense.categoryName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(expense.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-xl font-bold font-tabular" style={{ color: theme === 'light' ? '#84934A' : undefined }}>
                    Rs {expense.amount.toLocaleString('en-LK')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: theme === 'light' ? '#656D3F' : undefined }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: theme === 'light' ? '#492828' : undefined }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="btn-secondary"
          >
            Load More
          </button>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
        categories={categories}
      />
    </div>
  );
}
