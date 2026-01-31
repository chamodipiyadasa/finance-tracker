import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilter,
  PaginatedResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Budget,
  CreateBudgetRequest,
  DashboardSummary,
  AdminDashboard,
  UserSummary,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  SavingsGoal,
  SavingsTransaction,
  SavingsSummary,
  CreateSavingsGoalRequest,
  UpdateSavingsGoalRequest,
  AddSavingsTransactionRequest,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/me');
  }

  async updateProfile(request: { firstName?: string; lastName?: string; currency?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Expense endpoints
  async getExpenses(filter?: ExpenseFilter): Promise<ApiResponse<PaginatedResponse<Expense>>> {
    const params = new URLSearchParams();
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.categoryId) params.append('categoryId', filter.categoryId);
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString());
    
    const queryString = params.toString();
    return this.request<PaginatedResponse<Expense>>(`/api/expenses${queryString ? `?${queryString}` : ''}`);
  }

  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    return this.request<Expense>(`/api/expenses/${id}`);
  }

  async createExpense(request: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
    return this.request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateExpense(id: string, request: UpdateExpenseRequest): Promise<ApiResponse<Expense>> {
    return this.request<Expense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteExpense(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async getMonthlyTotal(month?: number, year?: number): Promise<ApiResponse<number>> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    return this.request<number>(`/api/expenses/monthly-total${queryString ? `?${queryString}` : ''}`);
  }

  // Category endpoints
  async getCategories(activeOnly: boolean = true): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>(`/api/categories?activeOnly=${activeOnly}`);
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/api/categories/${id}`);
  }

  async createCategory(request: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Budget endpoints
  async getCurrentBudget(): Promise<ApiResponse<Budget>> {
    return this.request<Budget>('/api/budgets/current');
  }

  async getBudgetByMonth(year: number, month: number): Promise<ApiResponse<Budget>> {
    return this.request<Budget>(`/api/budgets/${year}/${month}`);
  }

  async getAllBudgets(): Promise<ApiResponse<Budget[]>> {
    return this.request<Budget[]>('/api/budgets');
  }

  async createOrUpdateBudget(request: CreateBudgetRequest): Promise<ApiResponse<Budget>> {
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteBudget(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboard(month?: number, year?: number): Promise<ApiResponse<DashboardSummary>> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    return this.request<DashboardSummary>(`/api/dashboard${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return this.request<AdminDashboard>('/api/dashboard/admin');
  }

  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/dashboard/admin/stats');
  }

  // User management endpoints (Admin only)
  async getUsers(filter?: { page?: number; pageSize?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString());
    if (filter?.search) params.append('search', filter.search);
    
    const queryString = params.toString();
    return this.request<PaginatedResponse<User>>(`/api/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUserSummaries(): Promise<ApiResponse<UserSummary[]>> {
    return this.request<UserSummary[]>('/api/users/summaries');
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`);
  }

  async createUser(request: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Savings endpoints
  async getSavingsSummary(): Promise<ApiResponse<SavingsSummary>> {
    return this.request<SavingsSummary>('/api/savings/summary');
  }

  async getSavingsGoals(): Promise<ApiResponse<SavingsGoal[]>> {
    return this.request<SavingsGoal[]>('/api/savings/goals');
  }

  async getSavingsGoal(id: string): Promise<ApiResponse<SavingsGoal>> {
    return this.request<SavingsGoal>(`/api/savings/goals/${id}`);
  }

  async createSavingsGoal(request: CreateSavingsGoalRequest): Promise<ApiResponse<SavingsGoal>> {
    return this.request<SavingsGoal>('/api/savings/goals', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateSavingsGoal(id: string, request: UpdateSavingsGoalRequest): Promise<ApiResponse<SavingsGoal>> {
    return this.request<SavingsGoal>(`/api/savings/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteSavingsGoal(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/savings/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async addSavingsTransaction(goalId: string, request: AddSavingsTransactionRequest): Promise<ApiResponse<SavingsTransaction>> {
    return this.request<SavingsTransaction>(`/api/savings/goals/${goalId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getGoalTransactions(goalId: string): Promise<ApiResponse<SavingsTransaction[]>> {
    return this.request<SavingsTransaction[]>(`/api/savings/goals/${goalId}/transactions`);
  }

  async getRecentSavingsTransactions(limit: number = 20): Promise<ApiResponse<SavingsTransaction[]>> {
    return this.request<SavingsTransaction[]>(`/api/savings/transactions/recent?limit=${limit}`);
  }
}

export const api = new ApiService();
