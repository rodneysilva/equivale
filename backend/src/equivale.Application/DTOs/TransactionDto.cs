namespace equivale.Application.DTOs;

public record TransactionDto(
    string Id,
    string BuyerId,
    string? BuyerName,
    string SellerId,
    string? SellerName,
    string ItemType,
    string ItemId,
    string ItemTitle,
    int Quantity,
    decimal UnitPrice,
    decimal ShippingCost,
    decimal TotalPrice,
    string Status,
    string? TrackingInfo,
    string? DeliveryAddress,
    DateTime? OrderPlacedAt,
    DateTime? OrderConfirmedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? FinishedAt,
    DateTime CreatedAt);

public record CreateTransactionDto(
    string ItemId,
    string ItemType,
    int Quantity = 1,
    string? DeliveryAddress = null);
