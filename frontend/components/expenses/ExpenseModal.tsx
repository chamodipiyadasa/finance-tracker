'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Expense, Category, CreateExpenseRequest } from '@/types';
import { format } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateExpenseRequest) => Promise<void>;
  expense: Expense | null;
  categories: Category[];
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
  categories,
}: ExpenseModalProps) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategoryId(expense.categoryId);
      setDate(format(new Date(expense.date), 'yyyy-MM-dd'));
      setNotes(expense.notes || '');
    } else {
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
    }
  }, [expense, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId || !date) return;

    setIsSubmitting(true);
    try {
      await onSave({
        amount: parseFloat(amount),
        categoryId,
        date: new Date(date).toISOString(),
        notes: notes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 flex items-center justify-center overflow-y-auto"
          >
            <div className="glass-card p-6 w-full max-w-lg my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: theme === 'light' ? '#492828' : '#f5f3e0' }}>
                  {expense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme === 'light' ? '#656D3F' : '#a8a29e' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : '#d4c896' }}>
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: theme === 'light' ? '#84934A' : '#f9cdd5' }}>Rs</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      required
                      className="input-field pl-10 text-2xl font-semibold"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : '#d4c896' }}>
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setCategoryId(category.id)}
                        className="p-3 rounded-xl border transition-all"
                        style={{
                          borderColor: categoryId === category.id 
                            ? (theme === 'light' ? '#84934A' : '#f9cdd5')
                            : (theme === 'light' ? 'rgba(132, 147, 74, 0.3)' : 'rgba(249, 205, 213, 0.2)'),
                          background: categoryId === category.id
                            ? (theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(249, 205, 213, 0.1)')
                            : 'transparent'
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: category.color }}
                        />
                        <p className="text-xs truncate" style={{ color: theme === 'light' ? '#492828' : '#d4c896' }}>{category.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : '#d4c896' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : '#d4c896' }}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !amount || !categoryId}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
