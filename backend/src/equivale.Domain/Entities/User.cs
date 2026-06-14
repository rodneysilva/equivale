using equivale.Domain.Enums;

namespace equivale.Domain.Entities;

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public decimal WalletBalance { get; private set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public void Credit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Credit amount must be positive.", nameof(amount));

        WalletBalance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Debit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Debit amount must be positive.", nameof(amount));

        if (WalletBalance < amount)
            throw new InvalidOperationException("Insufficient wallet balance.");

        WalletBalance -= amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsAdmin() => Role == UserRole.Admin;
}
