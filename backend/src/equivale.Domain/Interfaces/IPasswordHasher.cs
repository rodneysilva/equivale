namespace equivale.Domain.Interfaces;

/// <summary>
/// Abstracao para hashing e verificacao de senhas.
/// A implementacao concreta (BCrypt, Argon2, etc.) vive na camada Infrastructure.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string plainText);
    bool Verify(string plainText, string hash);
}
