using FinanceTracker.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace FinanceTracker.API.Data;

/// <summary>
/// MongoDB database context for accessing collections
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
        
        // Create indexes
        CreateIndexes();
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Expense> Expenses => _database.GetCollection<Expense>("expenses");
    public IMongoCollection<Category> Categories => _database.GetCollection<Category>("categories");
    public IMongoCollection<Budget> Budgets => _database.GetCollection<Budget>("budgets");

    private void CreateIndexes()
    {
        // User indexes
        var userIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.Username);
        Users.Indexes.CreateOne(new CreateIndexModel<User>(userIndexKeys, new CreateIndexOptions { Unique = true }));

        // Expense indexes
        var expenseUserIdIndex = Builders<Expense>.IndexKeys.Ascending(e => e.UserId);
        var expenseDateIndex = Builders<Expense>.IndexKeys.Descending(e => e.Date);
        var expenseCompoundIndex = Builders<Expense>.IndexKeys
            .Ascending(e => e.UserId)
            .Descending(e => e.Date);
        
        Expenses.Indexes.CreateOne(new CreateIndexModel<Expense>(expenseUserIdIndex));
        Expenses.Indexes.CreateOne(new CreateIndexModel<Expense>(expenseDateIndex));
        Expenses.Indexes.CreateOne(new CreateIndexModel<Expense>(expenseCompoundIndex));

        // Budget indexes
        var budgetCompoundIndex = Builders<Budget>.IndexKeys
            .Ascending(b => b.UserId)
            .Ascending(b => b.Year)
            .Ascending(b => b.Month);
        Budgets.Indexes.CreateOne(new CreateIndexModel<Budget>(budgetCompoundIndex, new CreateIndexOptions { Unique = true }));

        // Category indexes
        var categoryNameIndex = Builders<Category>.IndexKeys.Ascending(c => c.Name);
        Categories.Indexes.CreateOne(new CreateIndexModel<Category>(categoryNameIndex, new CreateIndexOptions { Unique = true }));
    }
}
