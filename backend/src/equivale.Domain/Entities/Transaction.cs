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
    public decimal ShippingCost { get; set; } = 0;
    public Money TotalPrice { get; set; } = Money.Zero; // (UnitPrice * Qty) + ShippingCost

    public TransactionStatus Status { get; set; } = TransactionStatus.OrderPlaced;

    public string? TrackingInfo { get; set; }
    public string? DeliveryAddress { get; set; }
    public DateTime? OrderPlacedAt { get; set; }
    public DateTime? OrderConfirmedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public bool CanCancel => Status is TransactionStatus.OrderPlaced or TransactionStatus.OrderConfirmed or TransactionStatus.Shipped;
    public bool CanSellerConfirm => Status == TransactionStatus.OrderPlaced;
    public bool CanSellerShip => Status == TransactionStatus.OrderConfirmed;
    public bool CanBuyerConfirmDelivery => Status == TransactionStatus.Shipped;
    public bool CanFinish => Status == TransactionStatus.Delivered;

    public void SellerConfirmOrder()
    {
        if (!CanSellerConfirm) throw new InvalidOperationException("Não é possível confirmar o pedido neste estágio.");
        Status = TransactionStatus.OrderConfirmed;
        OrderConfirmedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SellerShip(string? trackingInfo = null)
    {
        if (!CanSellerShip) throw new InvalidOperationException("Não é possível confirmar o envio neste estágio.");
        Status = TransactionStatus.Shipped;
        ShippedAt = DateTime.UtcNow;
        TrackingInfo = trackingInfo ?? TrackingInfo;
        UpdatedAt = DateTime.UtcNow;
    }

    public void BuyerConfirmDelivery()
    {
        if (!CanBuyerConfirmDelivery) throw new InvalidOperationException("Não é possível confirmar a entrega neste estágio.");
        Status = TransactionStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Finish()
    {
        if (!CanFinish) throw new InvalidOperationException("A entrega precisa estar confirmada para finalizar.");
        Status = TransactionStatus.Finished;
        FinishedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (!CanCancel) throw new InvalidOperationException("A transação não pode ser cancelada neste estágio.");
        Status = TransactionStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
