namespace equivale.Application.DTOs;

public record CreateCommunityDto(string Name, string Description, string CreatorId, string? BannerUrl = null);
