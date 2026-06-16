using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;

namespace equivale.Domain.Entities;

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Email Email { get; set; } = null!;
    public string PasswordHash { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public List<SocialLink> SocialLinks { get; set; } = [];
    public UserRole Role { get; set; } = UserRole.User;
    public Money WalletBalance { get; private set; } = Money.Zero;
    public Money BlockedBalance { get; private set; } = Money.Zero;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public long Version { get; set; }

    public void Credit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Credit amount must be positive.", nameof(amount));

        WalletBalance = WalletBalance + amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Debit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Debit amount must be positive.", nameof(amount));

        if (WalletBalance < amount)
            throw new InvalidOperationException("Saldo insuficiente.");

        WalletBalance = WalletBalance - amount;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Reserva valor: move do saldo disponível para o saldo bloqueado (calção)</summary>
    public void Block(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Block amount must be positive.", nameof(amount));

        if (WalletBalance < amount)
            throw new InvalidOperationException("Saldo insuficiente para reserva.");

        WalletBalance = WalletBalance - amount;
        BlockedBalance = BlockedBalance + amount;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Desbloqueia valor: devolve do bloqueado para o disponível (estorno)</summary>
    public void Unblock(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Unblock amount must be positive.", nameof(amount));

        BlockedBalance = BlockedBalance - amount;
        WalletBalance = WalletBalance + amount;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Debita do bloqueado e credita outro usuário (libera pagamento)</summary>
    public void ReleaseBlocked(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Release amount must be positive.", nameof(amount));

        BlockedBalance = BlockedBalance - amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsAdmin() => Role == UserRole.Admin;
}
