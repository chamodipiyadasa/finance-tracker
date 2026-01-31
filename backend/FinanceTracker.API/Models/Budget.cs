using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FinanceTracker.API.Models;

/// <summary>
/// Budget entity for monthly budget management and savings tracking
/// </summary>
public class Budget
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("month")]
    public int Month { get; set; }

    [BsonElement("year")]
    public int Year { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
