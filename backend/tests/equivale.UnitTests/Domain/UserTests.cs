using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class UserTests
{
    private User CreateValidUser(decimal initialBalance = 100m)
    {
        return new User
        {
            Id = "user-1",
            Name = "Test User",
            Email = new Email("test@example.com"),
            PasswordHash = "hashed",
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public void Credit_PositiveAmount_ShouldIncreaseBalance()
    {
        var user = CreateValidUser();
        user.Credit(50m);
        ((decimal)user.WalletBalance).Should().Be(50m);
    }

    [Fact]
    public void Credit_MultipleCredits_ShouldAccumulate()
    {
        var user = CreateValidUser();
        user.Credit(50m);
        user.Credit(25m);
        ((decimal)user.WalletBalance).Should().Be(75m);
    }

    [Fact]
    public void Credit_NegativeAmount_ShouldThrowArgumentException()
    {
        var user = CreateValidUser();
        var act = () => user.Credit(-10m);
        act.Should().Throw<ArgumentException>()
           .WithMessage("*Credit amount must be positive*");
    }

    [Fact]
    public void Credit_ZeroAmount_ShouldThrowArgumentException()
    {
        var user = CreateValidUser();
        var act = () => user.Credit(0m);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Debit_PositiveAmount_ShouldDecreaseBalance()
    {
        var user = CreateValidUser();
        user.Credit(100m);
        user.Debit(30m);
        ((decimal)user.WalletBalance).Should().Be(70m);
    }

    [Fact]
    public void Debit_NegativeAmount_ShouldThrowArgumentException()
    {
        var user = CreateValidUser();
        user.Credit(100m);
        var act = () => user.Debit(-10m);
        act.Should().Throw<ArgumentException>()
           .WithMessage("*Debit amount must be positive*");
    }

    [Fact]
    public void Debit_InsufficientBalance_ShouldThrowInvalidOperationException()
    {
        var user = CreateValidUser();
        user.Credit(50m);
        var act = () => user.Debit(100m);
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*Saldo*");
    }

    [Fact]
    public void IsAdmin_AdminRole_ShouldReturnTrue()
    {
        var user = CreateValidUser();
        user.Role = UserRole.Admin;
        user.IsAdmin().Should().BeTrue();
    }

    [Fact]
    public void IsAdmin_UserRole_ShouldReturnFalse()
    {
        var user = CreateValidUser();
        user.IsAdmin().Should().BeFalse();
    }

    [Fact]
    public void Credit_ShouldUpdateUpdatedAt()
    {
        var user = CreateValidUser();
        var before = user.UpdatedAt;
        user.Credit(10m);
        user.UpdatedAt.Should().BeOnOrAfter(before);
    }
}
