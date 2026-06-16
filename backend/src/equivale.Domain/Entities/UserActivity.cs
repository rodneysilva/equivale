using equivale.Domain.Enums;

namespace equivale.Domain.Entities;

public class UserActivity
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public ActivityType Type { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? EntityTitle { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public long Version { get; set; }
}
