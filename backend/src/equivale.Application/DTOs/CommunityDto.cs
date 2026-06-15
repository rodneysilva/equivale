namespace equivale.Application.DTOs;

public record CommunityDto(
    string Id,
    string Name,
    string Description,
    string? ImageUrl,
    string? CoverUrl,
    string CreatorId,
    string? CreatorName,
    int MembersCount,
    string Type,
    List<string> Moderators,
    List<string>? ModeratorNames,
    string? InviteCode,
    string ProductVisibility,
    DateTime CreatedAt,
    DateTime UpdatedAt);
