using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;

namespace equivale.Domain.Entities;

public class Transaction
{
    public string Id { get; set; } = string.Empty;
    public string FromUserId { get; set; } = string.Empty;
    public string ToUserId { get; set; } = string.Empty;
    public Money Amount { get; set; } = Money.Zero;
    public string Description { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public string? RelatedItemId { get; set; }
    public DateTime CreatedAt { get; set; }
}
