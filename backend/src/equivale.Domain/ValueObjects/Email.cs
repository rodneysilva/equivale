namespace equivale.Domain.ValueObjects;

/// <summary>
/// Value Object que representa um endereco de email validado.
/// </summary>
public sealed class Email : IEquatable<Email>
{
    public string Address { get; }

    private Email() { Address = string.Empty; } // MongoDB deserialization

    public Email(string address)
    {
        if (string.IsNullOrWhiteSpace(address))
            throw new ArgumentException("Email cannot be empty.", nameof(address));

        var trimmed = address.Trim().ToLowerInvariant();

        if (!trimmed.Contains('@') || !trimmed.Split('@')[1].Contains('.'))
            throw new ArgumentException("Invalid email format.", nameof(address));

        Address = trimmed;
    }

    public static implicit operator string(Email email) => email.Address;
    public static implicit operator Email(string address) => new(address);

    public override string ToString() => Address;
    public override bool Equals(object? obj) => obj is Email other && Address == other.Address;
    public override int GetHashCode() => Address.GetHashCode();
    public bool Equals(Email? other) => other is not null && Address == other.Address;

    public static bool operator ==(Email? left, Email? right) => Equals(left, right);
    public static bool operator !=(Email? left, Email? right) => !Equals(left, right);
}
