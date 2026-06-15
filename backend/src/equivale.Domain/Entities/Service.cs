using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;

namespace equivale.Domain.Entities;

public class Service
{
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Money PriceInEquivale { get; set; } = Money.Zero;
    public List<string> Images { get; set; } = [];
    public TimeSpan? Duration { get; set; }
    public string? Location { get; set; }
    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public string? CommunityId { get; set; }
    public List<string> Tags { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
