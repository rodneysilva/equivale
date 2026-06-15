namespace equivale.Domain.Enums;

public enum TransactionStatus
{
    /// <summary>Comprador criou pedido + valor já bloqueado (calção)</summary>
    OrderPlaced,
    /// <summary>Vendedor confirmou o pedido</summary>
    OrderConfirmed,
    /// <summary>Vendedor confirmou envio / iniciou serviço</summary>
    Shipped,
    /// <summary>Comprador confirmou recebimento / conclusão</summary>
    Delivered,
    /// <summary>Avaliação feita — dinheiro liberado ao vendedor</summary>
    Finished,
    /// <summary>Cancelada — valor estornado ao comprador</summary>
    Cancelled
}

public enum TransactionItemType
{
    Product,
    Service
}
