namespace equivale.Domain.ValueObjects;

public sealed record Money
{
    public decimal Amount { get; private set; }
    public string Currency { get; } = "EQL";

    private Money(decimal amount) => Amount = amount;

    public static Money Create(decimal amount)
    {
        if (amount < 0)
            throw new ArgumentException("Money amount cannot be negative.", nameof(amount));

        return new Money(amount);
    }

    public static Money Zero() => new(0);

    public static Money operator +(Money left, Money right) =>
        new(left.Amount + right.Amount);

    public static Money operator -(Money left, Money right)
    {
        if (left.Amount < right.Amount)
            throw new InvalidOperationException("Insufficient funds for this operation.");

        return new(left.Amount - right.Amount);
    }

    public static implicit operator decimal(Money money) => money.Amount;
}
