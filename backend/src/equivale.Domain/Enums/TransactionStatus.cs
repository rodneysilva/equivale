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
