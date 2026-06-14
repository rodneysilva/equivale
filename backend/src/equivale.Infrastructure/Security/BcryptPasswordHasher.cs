using equivale.Domain.Interfaces;

namespace equivale.Infrastructure.Security;

/// <summary>
/// Implementacao de hashing de senhas usando BCrypt.
/// Detalhe de infraestrutura isolado do dominio via IPasswordHasher.
/// </summary>
public sealed class BcryptPasswordHasher : IPasswordHasher
{
    public string Hash(string plainText)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainText);
        return BCrypt.Net.BCrypt.HashPassword(plainText);
    }

    public bool Verify(string plainText, string hash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plainText);
        ArgumentException.ThrowIfNullOrWhiteSpace(hash);
        return BCrypt.Net.BCrypt.Verify(plainText, hash);
    }
}
