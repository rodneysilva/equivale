namespace equivale.Application.DTOs;

public record CreateProductDto(
    string SellerId,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    List<string>? Images = null);
