namespace equivale.Domain.Enums;

public enum TransactionStatus
{
    /// <summary>1. Comprador criou o pedido</summary>
    OrderPlaced,
    /// <summary>2. Vendedor confirmou o pedido</summary>
    OrderConfirmed,
    /// <summary>3. Comprador liberou pagamento (calção — valor reservado)</summary>
    PaymentReleased,
    /// <summary>4. Vendedor confirmou envio / iniciou serviço</summary>
    Shipped,
    /// <summary>5. Comprador confirmou recebimento / conclusão</summary>
    Delivered,
    /// <summary>6. Avaliação feita — dinheiro liberado ao vendedor</summary>
    Finished,
    /// <summary>Cancelada a qualquer momento</summary>
    Cancelled
}

public enum TransactionItemType
{
    Product,
    Service
}
