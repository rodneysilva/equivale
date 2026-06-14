using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;

namespace equivale.Domain.Entities;

public class Product
{
    public string Id { get; set; } = string.Empty;
    public string SellerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Money PriceInEquivale { get; set; } = Money.Zero;
    public List<string> Images { get; set; } = [];
    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
