using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FinanceTracker.API.Models;

/// <summary>
/// User entity for authentication and profile management
/// </summary>
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("username")]
    public string Username { get; set; } = null!;

    [BsonElement("email")]
    public string Email { get; set; } = null!;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = null!;

    [BsonElement("firstName")]
    public string FirstName { get; set; } = null!;

    [BsonElement("lastName")]
    public string LastName { get; set; } = null!;

    [BsonElement("role")]
    public string Role { get; set; } = "User"; // Admin or User

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("avatarUrl")]
    public string? AvatarUrl { get; set; }

    [BsonElement("currency")]
    public string Currency { get; set; } = "₹";

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("lastLoginAt")]
    public DateTime? LastLoginAt { get; set; }
}
