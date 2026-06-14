namespace equivale.Application.DTOs;

public record ProductDto(
    string Id,
    string SellerId,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    List<string> Images,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);
