'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PiggyBank, Plus, Target, TrendingUp, ArrowUpCircle, ArrowDownCircle,
  Edit2, Trash2, X, Calendar, Sparkles, CheckCircle2, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { SavingsGoal, SavingsTransaction, SavingsSummary, CreateSavingsGoalRequest, AddSavingsTransactionRequest } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';

const goalIcons = [
  { name: 'piggy-bank', icon: PiggyBank },
  { name: 'target', icon: Target },
  { name: 'sparkles', icon: Sparkles },
  { name: 'trending-up', icon: TrendingUp },
];

const goalColors = [
  '#84934A', '#656D3F', '#492828', '#E9B44C', '#9B2335', '#1B998B', '#5C6BC0', '#FF7043'
];

export default function SavingsPage() {
  const { theme } = useTheme();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<SavingsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // Form states
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('piggy-bank');
  const [goalColor, setGoalColor] = useState('#84934A');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transactionNote, setTransactionNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsRes, summaryRes, transactionsRes] = await Promise.all([
        api.getSavingsGoals(),
        api.getSavingsSummary(),
        api.getRecentSavingsTransactions(10),
      ]);

      if (goalsRes.success && goalsRes.data) setGoals(goalsRes.data);
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (transactionsRes.success && transactionsRes.data) setRecentTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Failed to load savings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setGoalDescription('');
    setGoalTarget('');
    setGoalIcon('piggy-bank');
    setGoalColor('#84934A');
    setGoalTargetDate('');
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalDescription(goal.description || '');
    setGoalTarget(goal.targetAmount.toString());
    setGoalIcon(goal.icon);
    setGoalColor(goal.color);
    setGoalTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
    setShowGoalModal(true);
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    setIsSubmitting(true);
    try {
      const request: CreateSavingsGoalRequest = {
        name: goalName,
        description: goalDescription || undefined,
        targetAmount: parseFloat(goalTarget),
        icon: goalIcon,
        color: goalColor,
        targetDate: goalTargetDate || undefined,
      };

      const response = editingGoal
        ? await api.updateSavingsGoal(editingGoal.id, request)
        : await api.createSavingsGoal(request);

      if (response.success) {
        toast.success(editingGoal ? 'Goal updated!' : 'Goal created!');
        await loadData();
        setShowGoalModal(false);
      }
    } catch (error) {
      toast.error('Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;

    try {
      const response = await api.deleteSavingsGoal(id);
      if (response.success) {
        toast.success('Goal deleted');
        await loadData();
      }
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleOpenTransaction = (goalId: string, type: 'deposit' | 'withdraw') => {
    setSelectedGoalId(goalId);
    setTransactionType(type);
    setTransactionAmount('');
    setTransactionNote('');
    setShowTransactionModal(true);
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !transactionAmount) return;

    setIsSubmitting(true);
    try {
      const request: AddSavingsTransactionRequest = {
        amount: parseFloat(transactionAmount),
        type: transactionType,
        note: transactionNote || undefined,
      };

      const response = await api.addSavingsTransaction(selectedGoalId, request);

      if (response.success) {
        toast.success(transactionType === 'deposit' ? 'Money added! 🎉' : 'Money withdrawn');
        await loadData();
        setShowTransactionModal(false);
      } else {
        toast.error(response.message || 'Transaction failed');
      }
    } catch (error) {
      toast.error('Failed to process transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rs ' + new Intl.NumberFormat('en-LK', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIconComponent = (iconName: string) => {
    const found = goalIcons.find(i => i.name === iconName);
    return found ? found.icon : PiggyBank;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 skeleton w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton" />)}
        </div>
        <div className="h-64 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
            Savings Goals
          </h1>
          <p style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
            Save money towards your dreams and goals
          </p>
        </div>
        <button onClick={handleCreateGoal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                style={{ backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : 'rgba(132, 147, 74, 0.3)' }}>
                <PiggyBank className="w-5 h-5" style={{ color: '#84934A' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Total Saved</p>
                <p className="text-xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {formatCurrency(summary.totalSaved)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'light' ? 'rgba(101, 109, 63, 0.2)' : 'rgba(101, 109, 63, 0.3)' }}>
                <Target className="w-5 h-5" style={{ color: '#656D3F' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Total Target</p>
                <p className="text-xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {formatCurrency(summary.totalTarget)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'light' ? 'rgba(73, 40, 40, 0.2)' : 'rgba(73, 40, 40, 0.3)' }}>
                <Clock className="w-5 h-5" style={{ color: '#492828' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Active Goals</p>
                <p className="text-xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {summary.activeGoals}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>Completed</p>
                <p className="text-xl font-bold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {summary.completedGoals}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, index) => {
            const IconComponent = getIconComponent(goal.icon);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-5"
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}30` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                        {goal.name}
                      </h3>
                      {goal.isCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                          Completed! 🎉
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" style={{ color: theme === 'light' ? '#656D3F' : undefined }} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span style={{ color: theme === 'light' ? '#492828' : undefined }}>
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div 
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme === 'light' ? '#ECECEC' : 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.percentageComplete}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                  <p className="text-sm mt-1 text-right" style={{ color: goal.color }}>
                    {goal.percentageComplete.toFixed(0)}%
                  </p>
                </div>

                {/* Remaining */}
                {!goal.isCompleted && (
                  <p className="text-sm mb-4" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    <span className="font-medium">{formatCurrency(goal.remainingAmount)}</span> remaining
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenTransaction(goal.id, 'deposit')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.2)' : 'rgba(132, 147, 74, 0.3)',
                      color: '#84934A'
                    }}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Add
                  </button>
                  {goal.currentAmount > 0 && (
                    <button
                      onClick={() => handleOpenTransaction(goal.id, 'withdraw')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: theme === 'light' ? 'rgba(73, 40, 40, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                        color: theme === 'light' ? '#492828' : '#ef4444'
                      }}
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      Withdraw
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <PiggyBank className="w-16 h-16 mx-auto mb-4" style={{ color: theme === 'light' ? '#84934A' : undefined }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme === 'light' ? '#492828' : undefined }}>
            No Savings Goals Yet
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
            Start your savings journey! Create a goal for something you want to save for.
          </p>
          <button onClick={handleCreateGoal} className="btn-primary">
            Create Your First Goal
          </button>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme === 'light' ? '#492828' : undefined }}>
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  {tx.type === 'deposit' ? (
                    <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <p className="font-medium" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                      {tx.savingsGoalName}
                    </p>
                    <p className="text-xs" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                      {tx.note && ` • ${tx.note}`}
                    </p>
                  </div>
                </div>
                <p className={clsx(
                  'font-semibold',
                  tx.type === 'deposit' ? 'text-emerald-500' : 'text-red-400'
                )}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {editingGoal ? 'Edit Goal' : 'New Savings Goal'}
                </h2>
                <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g., New Phone, Vacation, Emergency Fund"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Target Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: theme === 'light' ? '#84934A' : undefined }}>
                      Rs
                    </span>
                    <input
                      type="number"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      placeholder="50000"
                      min="1"
                      required
                      className="input-field pl-12 text-lg font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Description (optional)
                  </label>
                  <textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="What are you saving for?"
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Target Date (optional)
                  </label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {goalColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setGoalColor(color)}
                        className={clsx(
                          'w-8 h-8 rounded-full transition-transform',
                          goalColor === color && 'ring-2 ring-offset-2 ring-offset-dark-900 scale-110'
                        )}
                        style={{ backgroundColor: color, ringColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !goalName || !goalTarget}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingGoal ? 'Update' : 'Create Goal')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: theme === 'light' ? '#492828' : undefined }}>
                  {transactionType === 'deposit' ? 'Add Money' : 'Withdraw Money'}
                </h2>
                <button onClick={() => setShowTransactionModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: theme === 'light' ? '#84934A' : undefined }}>
                      Rs
                    </span>
                    <input
                      type="number"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="1000"
                      min="1"
                      required
                      className="input-field pl-12 text-xl font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme === 'light' ? '#656D3F' : undefined }}>
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={transactionNote}
                    onChange={(e) => setTransactionNote(e.target.value)}
                    placeholder="e.g., Monthly saving"
                    className="input-field"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransactionModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionAmount}
                    className={clsx(
                      'flex-1 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50',
                      transactionType === 'deposit'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    )}
                  >
                    {isSubmitting ? 'Processing...' : (transactionType === 'deposit' ? 'Add Money' : 'Withdraw')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
