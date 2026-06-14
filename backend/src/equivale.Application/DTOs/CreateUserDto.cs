namespace equivale.Application.DTOs;

public record CreateUserDto(string Name, string Email, string Password, string? AvatarUrl = null, string? Bio = null);
