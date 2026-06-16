namespace equivale.Domain.Entities;

public class Notification
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Description { get; set; }
    public bool Read { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public long Version { get; set; }
}
