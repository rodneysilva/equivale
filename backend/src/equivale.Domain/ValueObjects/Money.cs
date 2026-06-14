namespace equivale.Domain.ValueObjects;

/// <summary>
/// Value Object que representa um valor monetario em EQL (Equivale).
/// Encapsula regras de validacao e arredondamento.
/// </summary>
public sealed class Money : IEquatable<Money>
{
    public decimal Amount { get; }

    private Money() { } // MongoDB deserialization

    public Money(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentException("Money amount cannot be negative.", nameof(amount));

        Amount = Math.Round(amount, 2, MidpointRounding.ToEven);
    }

    public static Money Zero => new(0m);
    public static Money operator +(Money left, Money right) => new(left.Amount + right.Amount);
    public static Money operator -(Money left, Money right) => new(left.Amount - right.Amount);
    public static Money operator *(Money money, decimal factor) => new(money.Amount * factor);
    public static bool operator >(Money left, Money right) => left.Amount > right.Amount;
    public static bool operator <(Money left, Money right) => left.Amount < right.Amount;
    public static bool operator >=(Money left, Money right) => left.Amount >= right.Amount;
    public static bool operator <=(Money left, Money right) => left.Amount <= right.Amount;

    public static implicit operator decimal(Money money) => money.Amount;
    public static implicit operator Money(decimal amount) => new(amount);

    public Money Add(Money other) => new(Amount + other.Amount);
    public Money Subtract(Money other) => new(Amount - other.Amount);

    public override string ToString() => $"{Amount:F2} EQL";
    public override bool Equals(object? obj) => obj is Money other && Amount == other.Amount;
    public override int GetHashCode() => Amount.GetHashCode();
    public bool Equals(Money? other) => other is not null && Amount == other.Amount;

    public static bool operator ==(Money? left, Money? right) => Equals(left, right);
    public static bool operator !=(Money? left, Money? right) => !Equals(left, right);
}
