namespace equivale.Application.DTOs;

public record CreateServiceDto(
    string ProviderId,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    List<string>? Images = null,
    TimeSpan? Duration = null,
    string? Location = null,
    string? CommunityId = null,
    List<string>? Tags = null);
