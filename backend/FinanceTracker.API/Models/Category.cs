using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FinanceTracker.API.Models;

/// <summary>
/// Category entity for expense categorization
/// </summary>
public class Category
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("icon")]
    public string Icon { get; set; } = null!;

    [BsonElement("color")]
    public string Color { get; set; } = null!;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("isDefault")]
    public bool IsDefault { get; set; } = false;

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
