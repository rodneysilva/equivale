using equivale.Domain.Enums;

namespace equivale.Application.DTOs;

public record ProductDto(
    string Id,
    string SellerId,
    string? SellerName,
    string? SellerAvatarUrl,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    List<string> Images,
    string Status,
    string Condition,
    int Stock,
    string? CommunityId,
    string? CommunityName,
    List<string> Tags,
    DateTime CreatedAt,
    DateTime UpdatedAt);
