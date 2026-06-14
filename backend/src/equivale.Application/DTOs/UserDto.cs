namespace equivale.Application.DTOs;

public record UserDto(
    string Id,
    string Name,
    string Email,
    string? AvatarUrl,
    string? Bio,
    string Role,
    decimal WalletBalance,
    DateTime CreatedAt,
    DateTime UpdatedAt);
