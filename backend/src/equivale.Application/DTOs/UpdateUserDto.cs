using equivale.Domain.Entities;

namespace equivale.Application.DTOs;

public record UpdateUserDto(
    string? Name,
    string? AvatarUrl,
    string? Bio,
    List<SocialLink>? SocialLinks);
