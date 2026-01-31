using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.API.DTOs;

#region Authentication DTOs

public class LoginRequest
{
    [Required(ErrorMessage = "Username is required")]
    public string Username { get; set; } = null!;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = null!;
}

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public UserDto User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = null!;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string NewPassword { get; set; } = null!;
}

#endregion

#region User DTOs

public class UserDto
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool IsActive { get; set; }
    public string? AvatarUrl { get; set; }
    public string Currency { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class CreateUserRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = null!;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string FirstName { get; set; } = null!;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string LastName { get; set; } = null!;

    public string Role { get; set; } = "User";
    public string Currency { get; set; } = "₹";
}

public class UpdateUserRequest
{
    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(50, MinimumLength = 1)]
    public string? FirstName { get; set; }

    [StringLength(50, MinimumLength = 1)]
    public string? LastName { get; set; }

    public string? AvatarUrl { get; set; }
    public string? Currency { get; set; }
}

public class UserSummaryDto
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool IsActive { get; set; }
    public decimal TotalExpenses { get; set; }
    public int ExpenseCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

#endregion

#region Expense DTOs

public class ExpenseDto
{
    public string Id { get; set; } = null!;
    public decimal Amount { get; set; }
    public string CategoryId { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public string CategoryId { get; set; } = null!;

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class UpdateExpenseRequest
{
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal? Amount { get; set; }

    public string? CategoryId { get; set; }

    public DateTime? Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class ExpenseFilterRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? CategoryId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

#endregion

#region Category DTOs

public class CategoryDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public string Color { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCategoryRequest
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [Required]
    public string Icon { get; set; } = null!;

    [Required]
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must be a valid hex color")]
    public string Color { get; set; } = null!;

    [StringLength(200)]
    public string? Description { get; set; }
}

public class UpdateCategoryRequest
{
    [StringLength(50, MinimumLength = 1)]
    public string? Name { get; set; }

    public string? Icon { get; set; }

    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must be a valid hex color")]
    public string? Color { get; set; }

    [StringLength(200)]
    public string? Description { get; set; }

    public bool? IsActive { get; set; }
}

#endregion

#region Budget DTOs

public class BudgetDto
{
    public string Id { get; set; } = null!;
    public decimal Amount { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public double PercentageUsed { get; set; }
    public string Status { get; set; } = null!; // Good, Warning, Danger
}

public class CreateBudgetRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    [Range(1, 12, ErrorMessage = "Month must be between 1 and 12")]
    public int Month { get; set; }

    [Required]
    [Range(2000, 2100, ErrorMessage = "Year must be valid")]
    public int Year { get; set; }
}

public class UpdateBudgetRequest
{
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
}

#endregion

#region Savings DTOs

public class SavingsGoalDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public double PercentageComplete { get; set; }
    public string Icon { get; set; } = null!;
    public string Color { get; set; } = null!;
    public DateTime? TargetDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SavingsTransactionDto
{
    public string Id { get; set; } = null!;
    public string SavingsGoalId { get; set; } = null!;
    public string SavingsGoalName { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Type { get; set; } = null!; // "deposit" or "withdraw"
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSavingsGoalRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Target amount must be greater than 0")]
    public decimal TargetAmount { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }

    [StringLength(20)]
    public string? Color { get; set; }

    public DateTime? TargetDate { get; set; }
}

public class UpdateSavingsGoalRequest
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Target amount must be greater than 0")]
    public decimal? TargetAmount { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }

    [StringLength(20)]
    public string? Color { get; set; }

    public DateTime? TargetDate { get; set; }
}

public class AddSavingsTransactionRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^(deposit|withdraw)$", ErrorMessage = "Type must be 'deposit' or 'withdraw'")]
    public string Type { get; set; } = "deposit";

    [StringLength(500)]
    public string? Note { get; set; }
}

public class SavingsSummaryDto
{
    public decimal TotalSaved { get; set; }
    public decimal TotalTarget { get; set; }
    public int ActiveGoals { get; set; }
    public int CompletedGoals { get; set; }
    public double OverallProgress { get; set; }
}

#endregion

#region Dashboard DTOs

public class DashboardSummary
{
    public decimal TotalSpentThisMonth { get; set; }
    public decimal TotalSpentLastMonth { get; set; }
    public decimal PercentageChange { get; set; }
    public int TransactionCount { get; set; }
    public decimal AveragePerDay { get; set; }
    public BudgetDto? CurrentBudget { get; set; }
    public List<CategorySpending> TopCategories { get; set; } = new();
    public List<DailySpending> DailySpending { get; set; } = new();
    public List<MonthlySpending> MonthlyTrend { get; set; } = new();
    public string MotivationalMessage { get; set; } = null!;
}

public class CategorySpending
{
    public string CategoryId { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public string Color { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public decimal Amount { get; set; }
    public double Percentage { get; set; }
}

public class DailySpending
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
}

public class MonthlySpending
{
    public int Month { get; set; }
    public int Year { get; set; }
    public string MonthName { get; set; } = null!;
    public decimal Amount { get; set; }
}

public class AdminDashboard
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public decimal TotalExpenses { get; set; }
    public int TotalTransactions { get; set; }
    public List<UserSummaryDto> RecentUsers { get; set; } = new();
    public List<CategorySpending> OverallCategorySpending { get; set; } = new();
    public List<MonthlySpending> SystemMonthlyTrend { get; set; } = new();
}

#endregion

#region Common DTOs

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

#endregion
