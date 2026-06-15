namespace equivale.Domain.Enums;

public enum TransactionStatus
{
    Pending,
    ConfirmedByBuyer,
    ConfirmedBySeller,
    Completed,
    Cancelled
}

public enum TransactionItemType
{
    Product,
    Service
}

/// <summary>
/// Status do pedido (order) — fluxo logístico do item.
/// </summary>
public enum OrderStatus
{
    /// <summary>Pedido criado, aguardando confirmação da transação</summary>
    OrderPlaced,
    /// <summary>Transação confirmada (pagamento liberado)</summary>
    PaymentConfirmed,
    /// <summary>Produto enviado pelo vendedor / Serviço em andamento</summary>
    Shipped,
    /// <summary>Produto entregue / Serviço concluído (confirmado pelo comprador)</summary>
    Delivered,
    /// <summary>Pedido finalizado (após entrega + avaliação)</summary>
    Finished
}
