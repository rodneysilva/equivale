using equivale.Domain.Enums;

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
    decimal TotalPrice,
    string Status,
    DateTime? BuyerConfirmedAt,
    DateTime? SellerConfirmedAt,
    DateTime? CompletedAt,
    DateTime CreatedAt);

public record CreateTransactionDto(
    string ItemId,
    string ItemType,
    int Quantity = 1);
