// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'User';
  isActive: boolean;
  avatarUrl?: string;
  currency: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  totalExpenses: number;
  expenseCount: number;
  createdAt: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Expense types
export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  amount: number;
  categoryId: string;
  date: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  categoryId?: string;
  date?: string;
  notes?: string;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}

// Budget types
export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'Good' | 'Warning' | 'Danger';
}

export interface CreateBudgetRequest {
  amount: number;
  month: number;
  year: number;
}

// Savings types
export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageComplete: number;
  icon: string;
  color: string;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  savingsGoalId: string;
  savingsGoalName: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  note?: string;
  createdAt: string;
}

export interface SavingsSummary {
  totalSaved: number;
  totalTarget: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
}

export interface CreateSavingsGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  icon?: string;
  color?: string;
  targetDate?: string;
}

export interface UpdateSavingsGoalRequest {
  name?: string;
  description?: string;
  targetAmount?: number;
  icon?: string;
  color?: string;
  targetDate?: string;
}

export interface AddSavingsTransactionRequest {
  amount: number;
  type: 'deposit' | 'withdraw';
  note?: string;
}

// Dashboard types
export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface MonthlySpending {
  month: number;
  year: number;
  monthName: string;
  amount: number;
}

export interface DashboardSummary {
  totalSpentThisMonth: number;
  totalSpentLastMonth: number;
  percentageChange: number;
  transactionCount: number;
  averagePerDay: number;
  currentBudget?: Budget;
  topCategories: CategorySpending[];
  dailySpending: DailySpending[];
  monthlyTrend: MonthlySpending[];
  motivationalMessage: string;
}

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalExpenses: number;
  totalTransactions: number;
  recentUsers: UserSummary[];
  overallCategorySpending: CategorySpending[];
  systemMonthlyTrend: MonthlySpending[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Create user request (Admin only)
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  currency?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  currency?: string;
}
