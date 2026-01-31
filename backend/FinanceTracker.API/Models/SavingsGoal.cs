using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FinanceTracker.API.Models;

/// <summary>
/// SavingsGoal entity for tracking savings goals and deposits
/// </summary>
public class SavingsGoal
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("targetAmount")]
    public decimal TargetAmount { get; set; }

    [BsonElement("currentAmount")]
    public decimal CurrentAmount { get; set; } = 0;

    [BsonElement("icon")]
    public string Icon { get; set; } = "piggy-bank";

    [BsonElement("color")]
    public string Color { get; set; } = "#84934A";

    [BsonElement("targetDate")]
    public DateTime? TargetDate { get; set; }

    [BsonElement("isCompleted")]
    public bool IsCompleted { get; set; } = false;

    [BsonElement("completedAt")]
    public DateTime? CompletedAt { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// SavingsTransaction entity for tracking individual deposits/withdrawals
/// </summary>
public class SavingsTransaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("savingsGoalId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string SavingsGoalId { get; set; } = null!;

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("type")]
    public string Type { get; set; } = "deposit"; // "deposit" or "withdraw"

    [BsonElement("note")]
    public string? Note { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
