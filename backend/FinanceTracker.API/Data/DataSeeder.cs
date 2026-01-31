using FinanceTracker.API.Models;
using MongoDB.Driver;

namespace FinanceTracker.API.Data;

/// <summary>
/// Seeds initial data for the application
/// </summary>
public static class DataSeeder
{
    public static async Task SeedAsync(MongoDbContext context)
    {
        await SeedCategoriesAsync(context);
        await SeedUsersAsync(context);
        await SeedSampleDataAsync(context);
    }

    private static async Task SeedCategoriesAsync(MongoDbContext context)
    {
        var existingCategories = await context.Categories.CountDocumentsAsync(FilterDefinition<Category>.Empty);
        if (existingCategories > 0) return;

        var categories = new List<Category>
        {
            new Category
            {
                Name = "Food",
                Icon = "utensils",
                Color = "#FF6B6B",
                Description = "Food and dining expenses",
                IsDefault = true
            },
            new Category
            {
                Name = "Transport",
                Icon = "car",
                Color = "#4ECDC4",
                Description = "Transportation and travel expenses",
                IsDefault = true
            },
            new Category
            {
                Name = "Bills",
                Icon = "file-text",
                Color = "#45B7D1",
                Description = "Utility bills and subscriptions",
                IsDefault = true
            },
            new Category
            {
                Name = "Shopping",
                Icon = "shopping-bag",
                Color = "#96CEB4",
                Description = "Shopping and retail purchases",
                IsDefault = true
            },
            new Category
            {
                Name = "Investment",
                Icon = "trending-up",
                Color = "#FFEAA7",
                Description = "Investments and savings",
                IsDefault = true
            },
            new Category
            {
                Name = "Entertainment",
                Icon = "film",
                Color = "#DDA0DD",
                Description = "Entertainment and leisure activities",
                IsDefault = true
            },
            new Category
            {
                Name = "Healthcare",
                Icon = "heart",
                Color = "#FF9FF3",
                Description = "Medical and healthcare expenses",
                IsDefault = true
            },
            new Category
            {
                Name = "Education",
                Icon = "book",
                Color = "#54A0FF",
                Description = "Education and learning expenses",
                IsDefault = true
            },
            new Category
            {
                Name = "Others",
                Icon = "more-horizontal",
                Color = "#A0A0A0",
                Description = "Other miscellaneous expenses",
                IsDefault = true
            }
        };

        await context.Categories.InsertManyAsync(categories);
    }

    private static async Task SeedUsersAsync(MongoDbContext context)
    {
        var existingUsers = await context.Users.CountDocumentsAsync(FilterDefinition<User>.Empty);
        if (existingUsers > 0) return;

        var users = new List<User>
        {
            new User
            {
                Username = "admin",
                Email = "admin@financetracker.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FirstName = "System",
                LastName = "Administrator",
                Role = "Admin",
                IsActive = true,
                Currency = "₹"
            },
            new User
            {
                Username = "johndoe",
                Email = "john.doe@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                FirstName = "John",
                LastName = "Doe",
                Role = "User",
                IsActive = true,
                Currency = "₹"
            },
            new User
            {
                Username = "janedoe",
                Email = "jane.doe@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                FirstName = "Jane",
                LastName = "Doe",
                Role = "User",
                IsActive = true,
                Currency = "₹"
            }
        };

        await context.Users.InsertManyAsync(users);
    }

    private static async Task SeedSampleDataAsync(MongoDbContext context)
    {
        var existingExpenses = await context.Expenses.CountDocumentsAsync(FilterDefinition<Expense>.Empty);
        if (existingExpenses > 0) return;

        // Get user and categories
        var user = await context.Users.Find(u => u.Username == "johndoe").FirstOrDefaultAsync();
        var categories = await context.Categories.Find(FilterDefinition<Category>.Empty).ToListAsync();

        if (user == null || categories.Count == 0) return;

        var random = new Random();
        var expenses = new List<Expense>();
        var today = DateTime.UtcNow;

        // Generate 3 months of sample expense data
        for (int month = 0; month < 3; month++)
        {
            var currentMonth = today.AddMonths(-month);
            var daysInMonth = DateTime.DaysInMonth(currentMonth.Year, currentMonth.Month);

            for (int day = 1; day <= Math.Min(daysInMonth, today.Day + (month > 0 ? 31 : 0)); day++)
            {
                // Generate 1-4 expenses per day
                var expensesPerDay = random.Next(1, 5);
                for (int i = 0; i < expensesPerDay; i++)
                {
                    var category = categories[random.Next(categories.Count)];
                    var amount = Math.Round((decimal)(random.NextDouble() * 2000 + 50), 2);
                    var date = new DateTime(currentMonth.Year, currentMonth.Month, day);

                    if (date > today) continue;

                    expenses.Add(new Expense
                    {
                        UserId = user.Id,
                        Amount = amount,
                        CategoryId = category.Id,
                        CategoryName = category.Name,
                        Date = date,
                        Notes = GetRandomNote(category.Name, random),
                        CreatedAt = date,
                        UpdatedAt = date
                    });
                }
            }
        }

        if (expenses.Count > 0)
        {
            await context.Expenses.InsertManyAsync(expenses);
        }

        // Seed budget for current month
        var budget = new Budget
        {
            UserId = user.Id,
            Amount = 50000,
            Month = today.Month,
            Year = today.Year
        };

        await context.Budgets.InsertOneAsync(budget);
    }

    private static string GetRandomNote(string category, Random random)
    {
        var notes = category switch
        {
            "Food" => new[] { "Lunch at restaurant", "Groceries from supermarket", "Coffee and snacks", "Dinner with friends", "Ordered food online" },
            "Transport" => new[] { "Uber ride", "Fuel for car", "Metro card recharge", "Auto rickshaw", "Parking fee" },
            "Bills" => new[] { "Electricity bill", "Internet bill", "Phone recharge", "Water bill", "Netflix subscription" },
            "Shopping" => new[] { "New clothes", "Electronics purchase", "Home decor", "Online shopping", "Gift for friend" },
            "Investment" => new[] { "Mutual fund SIP", "Stock purchase", "Fixed deposit", "PPF contribution", "Gold savings" },
            "Entertainment" => new[] { "Movie tickets", "Concert tickets", "Gaming subscription", "Streaming service", "Night out" },
            "Healthcare" => new[] { "Doctor consultation", "Medicine purchase", "Health checkup", "Gym membership", "Supplements" },
            "Education" => new[] { "Online course", "Books purchase", "Tuition fee", "Certification exam", "Study materials" },
            _ => new[] { "Miscellaneous expense", "General expense", "Other purchase", "Unplanned expense", "Various items" }
        };

        return notes[random.Next(notes.Length)];
    }
}
