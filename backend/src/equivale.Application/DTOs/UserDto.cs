using equivale.Domain.Entities;

namespace equivale.Application.DTOs;

public record UserDto(
    string Id,
    string Name,
    string Email,
    string? AvatarUrl,
    string? Bio,
    List<SocialLink> SocialLinks,
    string Role,
    decimal WalletBalance,
    DateTime CreatedAt,
    DateTime UpdatedAt);
