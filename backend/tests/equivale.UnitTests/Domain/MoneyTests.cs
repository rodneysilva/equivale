using equivale.Domain.ValueObjects;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class MoneyTests
{
    [Fact]
    public void Constructor_PositiveAmount_ShouldCreateMoney()
    {
        var money = new Money(100.50m);
        money.Amount.Should().Be(100.50m);
    }

    [Fact]
    public void Constructor_Zero_ShouldCreateMoney()
    {
        var money = new Money(0m);
        money.Amount.Should().Be(0m);
    }

    [Fact]
    public void Constructor_NegativeAmount_ShouldThrowArgumentException()
    {
        var act = () => new Money(-10m);
        act.Should().Throw<ArgumentException>()
           .WithMessage("*Money amount cannot be negative*");
    }

    [Fact]
    public void Constructor_ShouldRoundToTwoDecimalPlaces()
    {
        var money = new Money(10.567m);
        money.Amount.Should().Be(10.57m);
    }

    [Fact]
    public void Zero_ShouldReturnZeroMoney()
    {
        Money.Zero.Amount.Should().Be(0m);
    }

    [Fact]
    public void Addition_ShouldReturnSum()
    {
        var a = new Money(100m);
        var b = new Money(50m);
        var result = a + b;
        result.Amount.Should().Be(150m);
    }

    [Fact]
    public void Subtraction_ShouldReturnDifference()
    {
        var a = new Money(100m);
        var b = new Money(30m);
        var result = a - b;
        result.Amount.Should().Be(70m);
    }

    [Fact]
    public void GreaterThan_ShouldReturnCorrectResult()
    {
        var a = new Money(100m);
        var b = new Money(50m);
        (a > b).Should().BeTrue();
        (b > a).Should().BeFalse();
    }

    [Fact]
    public void LessThan_ShouldReturnCorrectResult()
    {
        var a = new Money(50m);
        var b = new Money(100m);
        (a < b).Should().BeTrue();
        (b < a).Should().BeFalse();
    }

    [Fact]
    public void Equals_SameAmount_ShouldBeEqual()
    {
        var a = new Money(100m);
        var b = new Money(100m);
        a.Should().Be(b);
        (a == b).Should().BeTrue();
    }

    [Fact]
    public void ToString_ShouldFormatCorrectly()
    {
        var money = new Money(123.40m);
        money.ToString().Should().Contain("123");
        money.ToString().Should().Contain("EQL");
    }

    [Fact]
    public void ImplicitConversion_ToDecimal_ShouldReturnAmount()
    {
        var money = new Money(100m);
        decimal amount = money;
        amount.Should().Be(100m);
    }

    [Fact]
    public void ImplicitConversion_FromDecimal_ShouldCreateMoney()
    {
        Money money = 100m;
        money.Amount.Should().Be(100m);
    }
}
