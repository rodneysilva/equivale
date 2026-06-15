namespace equivale.Application.DTOs;

public record AuthResponseDto(
    string Token,
    string UserId,
    string Email,
    string Name,
    equivale.Domain.Enums.UserRole Role,
    decimal WalletBalance);
