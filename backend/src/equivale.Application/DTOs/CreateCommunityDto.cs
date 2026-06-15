namespace equivale.Application.DTOs;

public record CreateCommunityDto(
    string Name,
    string Description,
    string CreatorId,
    string? ImageUrl = null,
    string? CoverUrl = null,
    string Type = "open",
    string ProductVisibility = "public");
