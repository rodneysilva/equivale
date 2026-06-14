namespace equivale.Application.DTOs;

public record CommunityDto(
    string Id,
    string Name,
    string Description,
    string? BannerUrl,
    string CreatorId,
    List<string> Members,
    DateTime CreatedAt,
    DateTime UpdatedAt);
