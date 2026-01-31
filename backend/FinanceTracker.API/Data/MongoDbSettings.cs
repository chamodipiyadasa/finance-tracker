namespace FinanceTracker.API.Data;

/// <summary>
/// MongoDB connection settings
/// </summary>
public class MongoDbSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
}
