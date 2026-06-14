using equivale.Domain.Enums;

namespace equivale.Domain.Entities;

public class Service
{
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal PriceInEquivale { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? Location { get; set; }
    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
