using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;

namespace equivale.Domain.Entities;

public class Transaction
{
    public string Id { get; set; } = string.Empty;
    public string BuyerId { get; set; } = string.Empty;
    public string SellerId { get; set; } = string.Empty;
    public TransactionItemType ItemType { get; set; } = TransactionItemType.Product;
    public string ItemId { get; set; } = string.Empty;
    public string ItemTitle { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public Money UnitPrice { get; set; } = Money.Zero;
    public Money TotalPrice { get; set; } = Money.Zero;
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
    public DateTime? BuyerConfirmedAt { get; set; }
    public DateTime? SellerConfirmedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public bool IsCompleted => Status == TransactionStatus.Completed;
    public bool CanBeCancelled => Status is TransactionStatus.Pending or TransactionStatus.ConfirmedByBuyer or TransactionStatus.ConfirmedBySeller;
    public bool CanBuyerConfirm => Status is TransactionStatus.Pending or TransactionStatus.ConfirmedBySeller;
    public bool CanSellerConfirm => Status is TransactionStatus.Pending or TransactionStatus.ConfirmedByBuyer;

    public void ConfirmByBuyer()
    {
        if (!CanBuyerConfirm) throw new InvalidOperationException("Buyer cannot confirm at this stage.");
        BuyerConfirmedAt = DateTime.UtcNow;
        Status = SellerConfirmedAt is not null ? TransactionStatus.Completed : TransactionStatus.ConfirmedByBuyer;
        if (Status == TransactionStatus.Completed) CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ConfirmBySeller()
    {
        if (!CanSellerConfirm) throw new InvalidOperationException("Seller cannot confirm at this stage.");
        SellerConfirmedAt = DateTime.UtcNow;
        Status = BuyerConfirmedAt is not null ? TransactionStatus.Completed : TransactionStatus.ConfirmedBySeller;
        if (Status == TransactionStatus.Completed) CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (!CanBeCancelled) throw new InvalidOperationException("Transaction cannot be cancelled.");
        Status = TransactionStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
