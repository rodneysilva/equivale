namespace equivale.Application.DTOs;

public record CreateProductDto(
    string SellerId,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    List<string>? Images = null,
    string? Condition = null,
    string? CommunityId = null,
    List<string>? Tags = null);
