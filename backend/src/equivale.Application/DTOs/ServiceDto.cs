namespace equivale.Application.DTOs;

public record ServiceDto(
    string Id,
    string ProviderId,
    string? ProviderName,
    string? ProviderAvatarUrl,
    string Title,
    string Description,
    string Category,
    decimal PriceInEquivale,
    List<string> Images,
    TimeSpan? Duration,
    string? Location,
    string Status,
    string? CommunityId,
    string? CommunityName,
    List<string> Tags,
    DateTime CreatedAt,
    DateTime UpdatedAt);
