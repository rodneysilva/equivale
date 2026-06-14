namespace equivale.Application.DTOs;

public record ServiceDto(
    string Id,
    string ProviderId,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    TimeSpan? Duration,
    string? Location,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);
