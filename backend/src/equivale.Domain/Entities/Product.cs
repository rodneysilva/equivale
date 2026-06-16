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
    public decimal ShippingCost { get; set; } = 0;
    public List<string> Images { get; set; } = [];
    public ItemStatus Status { get; set; } = ItemStatus.Active;
    public ProductCondition Condition { get; set; } = ProductCondition.New;
    public int Stock { get; set; } = 1;
    public string? CommunityId { get; set; }
    public string? SellerName { get; set; }
    public string? SellerAvatarUrl { get; set; }
    public string? CommunityName { get; set; }
    public List<string> Tags { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public long Version { get; set; }
}
