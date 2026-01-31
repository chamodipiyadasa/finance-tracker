using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinanceTracker.API.DTOs;
using FinanceTracker.API.Models;
using FinanceTracker.API.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace FinanceTracker.API.Services;

#region Interfaces

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
    string GenerateJwtToken(User user);
}

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(string id);
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> CreateAsync(CreateUserRequest request);
    Task<UserDto?> UpdateAsync(string id, UpdateUserRequest request);
    Task<bool> DeleteAsync(string id);
    Task<bool> ToggleActiveStatusAsync(string id);
    Task<List<UserSummaryDto>> GetUserSummariesAsync();
}

public interface IExpenseService
{
    Task<ExpenseDto?> GetByIdAsync(string id, string userId);
    Task<PaginatedResponse<ExpenseDto>> GetByUserIdAsync(string userId, ExpenseFilterRequest filter);
    Task<ExpenseDto> CreateAsync(string userId, CreateExpenseRequest request);
    Task<ExpenseDto?> UpdateAsync(string id, string userId, UpdateExpenseRequest request);
    Task<bool> DeleteAsync(string id, string userId);
    Task<decimal> GetTotalForMonthAsync(string userId, int month, int year);
}

public interface ICategoryService
{
    Task<CategoryDto?> GetByIdAsync(string id);
    Task<List<CategoryDto>> GetAllAsync();
    Task<List<CategoryDto>> GetActiveAsync();
    Task<CategoryDto?> CreateAsync(CreateCategoryRequest request);
    Task<CategoryDto?> UpdateAsync(string id, UpdateCategoryRequest request);
    Task<bool> DeleteAsync(string id);
}

public interface IBudgetService
{
    Task<BudgetDto?> GetByIdAsync(string id, string userId);
    Task<BudgetDto?> GetCurrentBudgetAsync(string userId);
    Task<BudgetDto?> GetByMonthAsync(string userId, int month, int year);
    Task<List<BudgetDto>> GetAllByUserAsync(string userId);
    Task<BudgetDto> CreateOrUpdateAsync(string userId, CreateBudgetRequest request);
    Task<bool> DeleteAsync(string id, string userId);
}

public interface IDashboardService
{
    Task<DashboardSummary> GetDashboardAsync(string userId, int month, int year);
    Task<AdminDashboard> GetAdminDashboardAsync();
}

#endregion

#region Implementations

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        if (!user.IsActive)
            return null;

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user.Id, user);

        var token = GenerateJwtToken(user);
        var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "1440");

        return new LoginResponse
        {
            Token = token,
            User = MapToDto(user),
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user.Id, user);
        
        return true;
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "1440");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Role = user.Role,
        IsActive = user.IsActive,
        AvatarUrl = user.AvatarUrl,
        Currency = user.Currency,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IExpenseRepository _expenseRepository;

    public UserService(IUserRepository userRepository, IExpenseRepository expenseRepository)
    {
        _userRepository = userRepository;
        _expenseRepository = expenseRepository;
    }

    public async Task<UserDto?> GetByIdAsync(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<UserDto?> CreateAsync(CreateUserRequest request)
    {
        // Check if username exists
        var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUser != null) return null;

        // Check if email exists
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
        if (existingEmail != null) return null;

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            Currency = request.Currency,
            IsActive = true
        };

        var createdUser = await _userRepository.CreateAsync(user);
        return MapToDto(createdUser);
    }

    public async Task<UserDto?> UpdateAsync(string id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrEmpty(request.Email))
        {
            var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingEmail != null && existingEmail.Id != id) return null;
            user.Email = request.Email;
        }

        if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
        if (!string.IsNullOrEmpty(request.AvatarUrl)) user.AvatarUrl = request.AvatarUrl;
        if (!string.IsNullOrEmpty(request.Currency)) user.Currency = request.Currency;

        var updatedUser = await _userRepository.UpdateAsync(id, user);
        return updatedUser == null ? null : MapToDto(updatedUser);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        return await _userRepository.DeleteAsync(id);
    }

    public async Task<bool> ToggleActiveStatusAsync(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        await _userRepository.UpdateAsync(id, user);
        return true;
    }

    public async Task<List<UserSummaryDto>> GetUserSummariesAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var summaries = new List<UserSummaryDto>();

        foreach (var user in users)
        {
            var expenses = await _expenseRepository.GetByUserIdAsync(user.Id, null, null, null, 1, int.MaxValue);
            summaries.Add(new UserSummaryDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                TotalExpenses = expenses.Sum(e => e.Amount),
                ExpenseCount = expenses.Count,
                CreatedAt = user.CreatedAt
            });
        }

        return summaries;
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Role = user.Role,
        IsActive = user.IsActive,
        AvatarUrl = user.AvatarUrl,
        Currency = user.Currency,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };
}

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ICategoryRepository _categoryRepository;

    public ExpenseService(IExpenseRepository expenseRepository, ICategoryRepository categoryRepository)
    {
        _expenseRepository = expenseRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<ExpenseDto?> GetByIdAsync(string id, string userId)
    {
        var expense = await _expenseRepository.GetByIdAsync(id);
        if (expense == null || expense.UserId != userId) return null;
        return MapToDto(expense);
    }

    public async Task<PaginatedResponse<ExpenseDto>> GetByUserIdAsync(string userId, ExpenseFilterRequest filter)
    {
        var expenses = await _expenseRepository.GetByUserIdAsync(
            userId, filter.StartDate, filter.EndDate, filter.CategoryId, filter.Page, filter.PageSize);
        
        var totalCount = await _expenseRepository.GetCountByUserIdAsync(
            userId, filter.StartDate, filter.EndDate, filter.CategoryId);

        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        return new PaginatedResponse<ExpenseDto>
        {
            Items = expenses.Select(MapToDto).ToList(),
            TotalCount = (int)totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = totalPages,
            HasNextPage = filter.Page < totalPages,
            HasPreviousPage = filter.Page > 1
        };
    }

    public async Task<ExpenseDto> CreateAsync(string userId, CreateExpenseRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        
        var expense = new Expense
        {
            UserId = userId,
            Amount = request.Amount,
            CategoryId = request.CategoryId,
            CategoryName = category?.Name ?? "Unknown",
            Date = request.Date,
            Notes = request.Notes
        };

        var createdExpense = await _expenseRepository.CreateAsync(expense);
        return MapToDto(createdExpense);
    }

    public async Task<ExpenseDto?> UpdateAsync(string id, string userId, UpdateExpenseRequest request)
    {
        var expense = await _expenseRepository.GetByIdAsync(id);
        if (expense == null || expense.UserId != userId) return null;

        if (request.Amount.HasValue) expense.Amount = request.Amount.Value;
        if (!string.IsNullOrEmpty(request.CategoryId))
        {
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            expense.CategoryId = request.CategoryId;
            expense.CategoryName = category?.Name ?? "Unknown";
        }
        if (request.Date.HasValue) expense.Date = request.Date.Value;
        if (request.Notes != null) expense.Notes = request.Notes;

        var updatedExpense = await _expenseRepository.UpdateAsync(id, expense);
        return updatedExpense == null ? null : MapToDto(updatedExpense);
    }

    public async Task<bool> DeleteAsync(string id, string userId)
    {
        var expense = await _expenseRepository.GetByIdAsync(id);
        if (expense == null || expense.UserId != userId) return false;
        return await _expenseRepository.DeleteAsync(id);
    }

    public async Task<decimal> GetTotalForMonthAsync(string userId, int month, int year)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);
        return await _expenseRepository.GetTotalByUserIdAndDateRangeAsync(userId, startDate, endDate);
    }

    private static ExpenseDto MapToDto(Expense expense) => new()
    {
        Id = expense.Id,
        Amount = expense.Amount,
        CategoryId = expense.CategoryId,
        CategoryName = expense.CategoryName,
        Date = expense.Date,
        Notes = expense.Notes,
        CreatedAt = expense.CreatedAt
    };
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<CategoryDto?> GetByIdAsync(string id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category == null ? null : MapToDto(category);
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(MapToDto).ToList();
    }

    public async Task<List<CategoryDto>> GetActiveAsync()
    {
        var categories = await _categoryRepository.GetActiveAsync();
        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> CreateAsync(CreateCategoryRequest request)
    {
        var existing = await _categoryRepository.GetByNameAsync(request.Name);
        if (existing != null) return null;

        var category = new Category
        {
            Name = request.Name,
            Icon = request.Icon,
            Color = request.Color,
            Description = request.Description,
            IsDefault = false,
            IsActive = true
        };

        var createdCategory = await _categoryRepository.CreateAsync(category);
        return MapToDto(createdCategory);
    }

    public async Task<CategoryDto?> UpdateAsync(string id, UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return null;

        if (!string.IsNullOrEmpty(request.Name))
        {
            var existing = await _categoryRepository.GetByNameAsync(request.Name);
            if (existing != null && existing.Id != id) return null;
            category.Name = request.Name;
        }

        if (!string.IsNullOrEmpty(request.Icon)) category.Icon = request.Icon;
        if (!string.IsNullOrEmpty(request.Color)) category.Color = request.Color;
        if (request.Description != null) category.Description = request.Description;
        if (request.IsActive.HasValue) category.IsActive = request.IsActive.Value;

        var updatedCategory = await _categoryRepository.UpdateAsync(id, category);
        return updatedCategory == null ? null : MapToDto(updatedCategory);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null || category.IsDefault) return false;
        return await _categoryRepository.DeleteAsync(id);
    }

    private static CategoryDto MapToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Icon = category.Icon,
        Color = category.Color,
        Description = category.Description,
        IsDefault = category.IsDefault,
        IsActive = category.IsActive
    };
}

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly IExpenseRepository _expenseRepository;

    public BudgetService(IBudgetRepository budgetRepository, IExpenseRepository expenseRepository)
    {
        _budgetRepository = budgetRepository;
        _expenseRepository = expenseRepository;
    }

    public async Task<BudgetDto?> GetByIdAsync(string id, string userId)
    {
        var budget = await _budgetRepository.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId) return null;
        return await MapToDtoWithSpending(budget);
    }

    public async Task<BudgetDto?> GetCurrentBudgetAsync(string userId)
    {
        var now = DateTime.UtcNow;
        return await GetByMonthAsync(userId, now.Month, now.Year);
    }

    public async Task<BudgetDto?> GetByMonthAsync(string userId, int month, int year)
    {
        var budget = await _budgetRepository.GetByUserIdAndMonthAsync(userId, month, year);
        if (budget == null) return null;
        return await MapToDtoWithSpending(budget);
    }

    public async Task<List<BudgetDto>> GetAllByUserAsync(string userId)
    {
        var budgets = await _budgetRepository.GetByUserIdAsync(userId);
        var result = new List<BudgetDto>();
        foreach (var budget in budgets)
        {
            result.Add(await MapToDtoWithSpending(budget));
        }
        return result;
    }

    public async Task<BudgetDto> CreateOrUpdateAsync(string userId, CreateBudgetRequest request)
    {
        var existing = await _budgetRepository.GetByUserIdAndMonthAsync(userId, request.Month, request.Year);
        
        if (existing != null)
        {
            existing.Amount = request.Amount;
            await _budgetRepository.UpdateAsync(existing.Id, existing);
            return await MapToDtoWithSpending(existing);
        }

        var budget = new Budget
        {
            UserId = userId,
            Amount = request.Amount,
            Month = request.Month,
            Year = request.Year
        };

        var createdBudget = await _budgetRepository.CreateAsync(budget);
        return await MapToDtoWithSpending(createdBudget);
    }

    public async Task<bool> DeleteAsync(string id, string userId)
    {
        var budget = await _budgetRepository.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId) return false;
        return await _budgetRepository.DeleteAsync(id);
    }

    private async Task<BudgetDto> MapToDtoWithSpending(Budget budget)
    {
        var startDate = new DateTime(budget.Year, budget.Month, 1);
        var endDate = startDate.AddMonths(1);
        var spent = await _expenseRepository.GetTotalByUserIdAndDateRangeAsync(budget.UserId, startDate, endDate);
        var remaining = budget.Amount - spent;
        var percentageUsed = budget.Amount > 0 ? (double)(spent / budget.Amount) * 100 : 0;

        var status = percentageUsed switch
        {
            <= 50 => "Good",
            <= 80 => "Warning",
            _ => "Danger"
        };

        return new BudgetDto
        {
            Id = budget.Id,
            Amount = budget.Amount,
            Month = budget.Month,
            Year = budget.Year,
            Spent = spent,
            Remaining = remaining,
            PercentageUsed = Math.Round(percentageUsed, 2),
            Status = status
        };
    }
}

public class DashboardService : IDashboardService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBudgetService _budgetService;
    private readonly IUserRepository _userRepository;

    public DashboardService(
        IExpenseRepository expenseRepository, 
        ICategoryRepository categoryRepository,
        IBudgetService budgetService,
        IUserRepository userRepository)
    {
        _expenseRepository = expenseRepository;
        _categoryRepository = categoryRepository;
        _budgetService = budgetService;
        _userRepository = userRepository;
    }

    public async Task<DashboardSummary> GetDashboardAsync(string userId, int month, int year)
    {
        var startOfMonth = new DateTime(year, month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);
        var startOfLastMonth = startOfMonth.AddMonths(-1);

        // Current month expenses
        var thisMonthExpenses = await _expenseRepository.GetByUserIdAsync(
            userId, startOfMonth, endOfMonth, null, 1, int.MaxValue);
        
        var totalThisMonth = thisMonthExpenses.Sum(e => e.Amount);
        
        // Last month expenses
        var totalLastMonth = await _expenseRepository.GetTotalByUserIdAndDateRangeAsync(
            userId, startOfLastMonth, startOfMonth);

        // Calculate percentage change
        var percentageChange = totalLastMonth > 0 
            ? Math.Round((double)((totalThisMonth - totalLastMonth) / totalLastMonth) * 100, 2) 
            : 0;

        // Daily average
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var currentDay = month == DateTime.UtcNow.Month && year == DateTime.UtcNow.Year 
            ? DateTime.UtcNow.Day 
            : daysInMonth;
        var averagePerDay = currentDay > 0 ? Math.Round(totalThisMonth / currentDay, 2) : 0;

        // Category spending
        var categories = await _categoryRepository.GetAllAsync();
        var categorySpending = thisMonthExpenses
            .GroupBy(e => e.CategoryId)
            .Select(g =>
            {
                var category = categories.FirstOrDefault(c => c.Id == g.Key);
                return new CategorySpending
                {
                    CategoryId = g.Key,
                    CategoryName = category?.Name ?? "Unknown",
                    Color = category?.Color ?? "#A0A0A0",
                    Icon = category?.Icon ?? "more-horizontal",
                    Amount = g.Sum(e => e.Amount),
                    Percentage = totalThisMonth > 0 ? Math.Round((double)(g.Sum(e => e.Amount) / totalThisMonth) * 100, 2) : 0
                };
            })
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        // Daily spending
        var dailySpending = thisMonthExpenses
            .GroupBy(e => e.Date.Date)
            .Select(g => new DailySpending
            {
                Date = g.Key,
                Amount = g.Sum(e => e.Amount)
            })
            .OrderBy(d => d.Date)
            .ToList();

        // Monthly trend (last 6 months)
        var monthlyTrend = new List<MonthlySpending>();
        for (int i = 5; i >= 0; i--)
        {
            var trendMonth = startOfMonth.AddMonths(-i);
            var trendEndMonth = trendMonth.AddMonths(1);
            var total = await _expenseRepository.GetTotalByUserIdAndDateRangeAsync(userId, trendMonth, trendEndMonth);
            
            monthlyTrend.Add(new MonthlySpending
            {
                Month = trendMonth.Month,
                Year = trendMonth.Year,
                MonthName = trendMonth.ToString("MMM"),
                Amount = total
            });
        }

        // Budget
        var budget = await _budgetService.GetByMonthAsync(userId, month, year);

        // Motivational message
        var motivationalMessage = GetMotivationalMessage(totalThisMonth, totalLastMonth, budget);

        return new DashboardSummary
        {
            TotalSpentThisMonth = totalThisMonth,
            TotalSpentLastMonth = totalLastMonth,
            PercentageChange = (decimal)percentageChange,
            TransactionCount = thisMonthExpenses.Count,
            AveragePerDay = averagePerDay,
            CurrentBudget = budget,
            TopCategories = categorySpending,
            DailySpending = dailySpending,
            MonthlyTrend = monthlyTrend,
            MotivationalMessage = motivationalMessage
        };
    }

    public async Task<AdminDashboard> GetAdminDashboardAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var totalUsers = users.Count;
        var activeUsers = users.Count(u => u.IsActive);

        var totalTransactions = await _expenseRepository.GetTotalCountAsync();
        var totalExpenses = await _expenseRepository.GetSystemTotalAsync();

        // User summaries
        var userSummaries = new List<UserSummaryDto>();
        foreach (var user in users.Take(10))
        {
            var expenses = await _expenseRepository.GetByUserIdAsync(user.Id, null, null, null, 1, int.MaxValue);
            userSummaries.Add(new UserSummaryDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                TotalExpenses = expenses.Sum(e => e.Amount),
                ExpenseCount = expenses.Count,
                CreatedAt = user.CreatedAt
            });
        }

        // Overall category spending
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);
        var allExpenses = await _expenseRepository.GetAllByDateRangeAsync(startOfMonth, endOfMonth);
        var categories = await _categoryRepository.GetAllAsync();
        var totalMonthExpenses = allExpenses.Sum(e => e.Amount);

        var categorySpending = allExpenses
            .GroupBy(e => e.CategoryId)
            .Select(g =>
            {
                var category = categories.FirstOrDefault(c => c.Id == g.Key);
                return new CategorySpending
                {
                    CategoryId = g.Key,
                    CategoryName = category?.Name ?? "Unknown",
                    Color = category?.Color ?? "#A0A0A0",
                    Icon = category?.Icon ?? "more-horizontal",
                    Amount = g.Sum(e => e.Amount),
                    Percentage = totalMonthExpenses > 0 ? Math.Round((double)(g.Sum(e => e.Amount) / totalMonthExpenses) * 100, 2) : 0
                };
            })
            .OrderByDescending(c => c.Amount)
            .ToList();

        // System monthly trend
        var monthlyTrend = new List<MonthlySpending>();
        for (int i = 5; i >= 0; i--)
        {
            var trendMonth = startOfMonth.AddMonths(-i);
            var trendEndMonth = trendMonth.AddMonths(1);
            var expenses = await _expenseRepository.GetAllByDateRangeAsync(trendMonth, trendEndMonth);
            
            monthlyTrend.Add(new MonthlySpending
            {
                Month = trendMonth.Month,
                Year = trendMonth.Year,
                MonthName = trendMonth.ToString("MMM"),
                Amount = expenses.Sum(e => e.Amount)
            });
        }

        return new AdminDashboard
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalExpenses = totalExpenses,
            TotalTransactions = (int)totalTransactions,
            RecentUsers = userSummaries,
            OverallCategorySpending = categorySpending,
            SystemMonthlyTrend = monthlyTrend
        };
    }

    private static string GetMotivationalMessage(decimal thisMonth, decimal lastMonth, BudgetDto? budget)
    {
        var messages = new List<string>();

        if (budget != null)
        {
            if (budget.PercentageUsed < 50)
                messages.Add("🎉 Great job! You're well within your budget this month!");
            else if (budget.PercentageUsed < 80)
                messages.Add("💪 Good progress! Keep an eye on your spending to stay on track.");
            else if (budget.PercentageUsed < 100)
                messages.Add("⚠️ Heads up! You're approaching your budget limit.");
            else
                messages.Add("🚨 Budget exceeded! Consider reviewing your expenses.");
        }

        if (lastMonth > 0)
        {
            if (thisMonth < lastMonth)
                messages.Add($"📉 You're spending {Math.Round((lastMonth - thisMonth) / lastMonth * 100)}% less than last month!");
            else if (thisMonth > lastMonth * 1.2m)
                messages.Add("📈 Spending is up this month. Try to identify areas to cut back.");
        }

        if (messages.Count == 0)
            messages.Add("💰 Track your expenses daily for better financial health!");

        return messages[new Random().Next(messages.Count)];
    }
}

#endregion
