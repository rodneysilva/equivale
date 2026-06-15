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

    // Status da transação financeira
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

    // Status do pedido (logística)
    public OrderStatus OrderStatus { get; set; } = OrderStatus.OrderPlaced;

    public DateTime? BuyerConfirmedAt { get; set; }
    public DateTime? SellerConfirmedAt { get; set; }
    public DateTime? PaymentConfirmedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public bool IsCompleted => Status == TransactionStatus.Completed;
    public bool CanBeCancelled => Status is TransactionStatus.Pending or TransactionStatus.ConfirmedByBuyer or TransactionStatus.ConfirmedBySeller;
    public bool CanBuyerConfirm => Status is TransactionStatus.Pending or TransactionStatus.ConfirmedBySeller;
    public bool CanSellerConfirm => Status is TransactionStatus.Pending or TransactionStatus.ConfirmedByBuyer;
    public bool CanShip => Status == TransactionStatus.Completed && OrderStatus == OrderStatus.PaymentConfirmed;
    public bool CanDeliver => OrderStatus == OrderStatus.Shipped;

    public void ConfirmByBuyer()
    {
        if (!CanBuyerConfirm) throw new InvalidOperationException("O comprador não pode confirmar neste estágio.");
        BuyerConfirmedAt = DateTime.UtcNow;
        Status = SellerConfirmedAt is not null ? TransactionStatus.Completed : TransactionStatus.ConfirmedByBuyer;
        if (Status == TransactionStatus.Completed)
        {
            PaymentConfirmedAt = DateTime.UtcNow;
            OrderStatus = OrderStatus.PaymentConfirmed;
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void ConfirmBySeller()
    {
        if (!CanSellerConfirm) throw new InvalidOperationException("O vendedor não pode confirmar neste estágio.");
        SellerConfirmedAt = DateTime.UtcNow;
        Status = BuyerConfirmedAt is not null ? TransactionStatus.Completed : TransactionStatus.ConfirmedBySeller;
        if (Status == TransactionStatus.Completed)
        {
            PaymentConfirmedAt = DateTime.UtcNow;
            OrderStatus = OrderStatus.PaymentConfirmed;
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkShipped()
    {
        if (!CanShip) throw new InvalidOperationException("O pedido não pode ser enviado neste estágio.");
        OrderStatus = OrderStatus.Shipped;
        ShippedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkDelivered()
    {
        if (!CanDeliver) throw new InvalidOperationException("O pedido não pode ser marcado como entregue.");
        OrderStatus = OrderStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Finish()
    {
        if (OrderStatus != OrderStatus.Delivered) throw new InvalidOperationException("O pedido precisa estar entregue para finalizar.");
        OrderStatus = OrderStatus.Finished;
        FinishedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (!CanBeCancelled) throw new InvalidOperationException("A transação não pode ser cancelada.");
        Status = TransactionStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
