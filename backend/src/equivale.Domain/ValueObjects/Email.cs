using System.Text.RegularExpressions;

namespace equivale.Domain.ValueObjects;

public sealed record Email
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty.", nameof(value));

        var pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        if (!Regex.IsMatch(value, pattern))
            throw new ArgumentException("Invalid email format.", nameof(value));

        return new Email(value.ToLowerInvariant());
    }

    public static implicit operator string(Email email) => email.Value;
}
