namespace equivale.Application.DTOs;

public record UpdateCommunityDto(
    string? Name = null,
    string? Description = null,
    string? ImageUrl = null,
    string? CoverUrl = null,
    string? Type = null,
    string? ProductVisibility = null);
