using FinanceTracker.API.Data;
using FinanceTracker.API.Models;
using MongoDB.Driver;

namespace FinanceTracker.API.Repositories;

#region Interfaces

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<List<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task<User?> UpdateAsync(string id, User user);
    Task<bool> DeleteAsync(string id);
    Task<long> GetCountAsync();
}

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(string id);
    Task<List<Expense>> GetByUserIdAsync(string userId, DateTime? startDate, DateTime? endDate, string? categoryId, int page, int pageSize);
    Task<long> GetCountByUserIdAsync(string userId, DateTime? startDate, DateTime? endDate, string? categoryId);
    Task<Expense> CreateAsync(Expense expense);
    Task<Expense?> UpdateAsync(string id, Expense expense);
    Task<bool> DeleteAsync(string id);
    Task<decimal> GetTotalByUserIdAndDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
    Task<List<Expense>> GetAllByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<long> GetTotalCountAsync();
    Task<decimal> GetSystemTotalAsync();
}

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(string id);
    Task<Category?> GetByNameAsync(string name);
    Task<List<Category>> GetAllAsync();
    Task<List<Category>> GetActiveAsync();
    Task<Category> CreateAsync(Category category);
    Task<Category?> UpdateAsync(string id, Category category);
    Task<bool> DeleteAsync(string id);
}

public interface IBudgetRepository
{
    Task<Budget?> GetByIdAsync(string id);
    Task<Budget?> GetByUserIdAndMonthAsync(string userId, int month, int year);
    Task<List<Budget>> GetByUserIdAsync(string userId);
    Task<Budget> CreateAsync(Budget budget);
    Task<Budget?> UpdateAsync(string id, Budget budget);
    Task<bool> DeleteAsync(string id);
}

#endregion

#region Implementations

public class UserRepository : IUserRepository
{
    private readonly MongoDbContext _context;

    public UserRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.Find(u => u.Username.ToLower() == username.ToLower()).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.Find(u => u.Email.ToLower() == email.ToLower()).FirstOrDefaultAsync();
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users.Find(FilterDefinition<User>.Empty).ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        await _context.Users.InsertOneAsync(user);
        return user;
    }

    public async Task<User?> UpdateAsync(string id, User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Users.ReplaceOneAsync(u => u.Id == id, user);
        return result.IsAcknowledged ? user : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<long> GetCountAsync()
    {
        return await _context.Users.CountDocumentsAsync(FilterDefinition<User>.Empty);
    }
}

public class ExpenseRepository : IExpenseRepository
{
    private readonly MongoDbContext _context;

    public ExpenseRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Expense?> GetByIdAsync(string id)
    {
        return await _context.Expenses.Find(e => e.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Expense>> GetByUserIdAsync(string userId, DateTime? startDate, DateTime? endDate, string? categoryId, int page, int pageSize)
    {
        var filter = BuildFilter(userId, startDate, endDate, categoryId);
        return await _context.Expenses
            .Find(filter)
            .SortByDescending(e => e.Date)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
    }

    public async Task<long> GetCountByUserIdAsync(string userId, DateTime? startDate, DateTime? endDate, string? categoryId)
    {
        var filter = BuildFilter(userId, startDate, endDate, categoryId);
        return await _context.Expenses.CountDocumentsAsync(filter);
    }

    public async Task<Expense> CreateAsync(Expense expense)
    {
        await _context.Expenses.InsertOneAsync(expense);
        return expense;
    }

    public async Task<Expense?> UpdateAsync(string id, Expense expense)
    {
        expense.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Expenses.ReplaceOneAsync(e => e.Id == id, expense);
        return result.IsAcknowledged ? expense : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Expenses.DeleteOneAsync(e => e.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<decimal> GetTotalByUserIdAndDateRangeAsync(string userId, DateTime startDate, DateTime endDate)
    {
        var filter = Builders<Expense>.Filter.And(
            Builders<Expense>.Filter.Eq(e => e.UserId, userId),
            Builders<Expense>.Filter.Gte(e => e.Date, startDate),
            Builders<Expense>.Filter.Lt(e => e.Date, endDate)
        );

        var expenses = await _context.Expenses.Find(filter).ToListAsync();
        return expenses.Sum(e => e.Amount);
    }

    public async Task<List<Expense>> GetAllByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var filter = Builders<Expense>.Filter.And(
            Builders<Expense>.Filter.Gte(e => e.Date, startDate),
            Builders<Expense>.Filter.Lt(e => e.Date, endDate)
        );

        return await _context.Expenses.Find(filter).ToListAsync();
    }

    public async Task<long> GetTotalCountAsync()
    {
        return await _context.Expenses.CountDocumentsAsync(FilterDefinition<Expense>.Empty);
    }

    public async Task<decimal> GetSystemTotalAsync()
    {
        var expenses = await _context.Expenses.Find(FilterDefinition<Expense>.Empty).ToListAsync();
        return expenses.Sum(e => e.Amount);
    }

    private static FilterDefinition<Expense> BuildFilter(string userId, DateTime? startDate, DateTime? endDate, string? categoryId)
    {
        var builder = Builders<Expense>.Filter;
        var filters = new List<FilterDefinition<Expense>> { builder.Eq(e => e.UserId, userId) };

        if (startDate.HasValue)
            filters.Add(builder.Gte(e => e.Date, startDate.Value));

        if (endDate.HasValue)
            filters.Add(builder.Lt(e => e.Date, endDate.Value));

        if (!string.IsNullOrEmpty(categoryId))
            filters.Add(builder.Eq(e => e.CategoryId, categoryId));

        return builder.And(filters);
    }
}

public class CategoryRepository : ICategoryRepository
{
    private readonly MongoDbContext _context;

    public CategoryRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(string id)
    {
        return await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Category?> GetByNameAsync(string name)
    {
        return await _context.Categories.Find(c => c.Name.ToLower() == name.ToLower()).FirstOrDefaultAsync();
    }

    public async Task<List<Category>> GetAllAsync()
    {
        return await _context.Categories.Find(FilterDefinition<Category>.Empty).ToListAsync();
    }

    public async Task<List<Category>> GetActiveAsync()
    {
        return await _context.Categories.Find(c => c.IsActive).ToListAsync();
    }

    public async Task<Category> CreateAsync(Category category)
    {
        await _context.Categories.InsertOneAsync(category);
        return category;
    }

    public async Task<Category?> UpdateAsync(string id, Category category)
    {
        category.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);
        return result.IsAcknowledged ? category : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Categories.DeleteOneAsync(c => c.Id == id);
        return result.DeletedCount > 0;
    }
}

public class BudgetRepository : IBudgetRepository
{
    private readonly MongoDbContext _context;

    public BudgetRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Budget?> GetByIdAsync(string id)
    {
        return await _context.Budgets.Find(b => b.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Budget?> GetByUserIdAndMonthAsync(string userId, int month, int year)
    {
        return await _context.Budgets
            .Find(b => b.UserId == userId && b.Month == month && b.Year == year)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Budget>> GetByUserIdAsync(string userId)
    {
        return await _context.Budgets.Find(b => b.UserId == userId).ToListAsync();
    }

    public async Task<Budget> CreateAsync(Budget budget)
    {
        await _context.Budgets.InsertOneAsync(budget);
        return budget;
    }

    public async Task<Budget?> UpdateAsync(string id, Budget budget)
    {
        budget.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Budgets.ReplaceOneAsync(b => b.Id == id, budget);
        return result.IsAcknowledged ? budget : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Budgets.DeleteOneAsync(b => b.Id == id);
        return result.DeletedCount > 0;
    }
}

#endregion
