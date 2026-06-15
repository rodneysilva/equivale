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

    public TransactionStatus Status { get; set; } = TransactionStatus.OrderPlaced;

    // Logística
    public string? TrackingInfo { get; set; }
    public DateTime? OrderPlacedAt { get; set; }
    public DateTime? OrderConfirmedAt { get; set; }
    public DateTime? PaymentReleasedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Regras de transição
    public bool CanCancel => Status is TransactionStatus.OrderPlaced or TransactionStatus.OrderConfirmed
        or TransactionStatus.PaymentReleased or TransactionStatus.Shipped;

    public bool CanSellerConfirmOrder => Status == TransactionStatus.OrderPlaced;
    public bool CanBuyerReleasePayment => Status == TransactionStatus.OrderConfirmed;
    public bool CanSellerShip => Status == TransactionStatus.PaymentReleased;
    public bool CanBuyerConfirmDelivery => Status == TransactionStatus.Shipped;
    public bool CanFinish => Status == TransactionStatus.Delivered;

    public void SellerConfirmOrder()
    {
        if (!CanSellerConfirmOrder) throw new InvalidOperationException("O vendedor não pode confirmar o pedido neste estágio.");
        Status = TransactionStatus.OrderConfirmed;
        OrderConfirmedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void BuyerReleasePayment()
    {
        if (!CanBuyerReleasePayment) throw new InvalidOperationException("O comprador não pode liberar o pagamento neste estágio.");
        Status = TransactionStatus.PaymentReleased;
        PaymentReleasedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SellerShip(string? trackingInfo = null)
    {
        if (!CanSellerShip) throw new InvalidOperationException("O envio não pode ser confirmado neste estágio.");
        Status = TransactionStatus.Shipped;
        ShippedAt = DateTime.UtcNow;
        TrackingInfo = trackingInfo ?? TrackingInfo;
        UpdatedAt = DateTime.UtcNow;
    }

    public void BuyerConfirmDelivery()
    {
        if (!CanBuyerConfirmDelivery) throw new InvalidOperationException("A entrega não pode ser confirmada neste estágio.");
        Status = TransactionStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Finish()
    {
        if (!CanFinish) throw new InvalidOperationException("A transação precisa estar entregue para finalizar.");
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
