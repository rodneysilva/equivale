using equivale.Domain.Entities;
using equivale.Domain.ValueObjects;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class UserWalletTests
{
    private static User CreateUser(decimal initialCredit = 0)
    {
        var user = new User
        {
            Id = "user-1",
            Name = "Test User",
            Email = new Email("test@example.com"),
            PasswordHash = "hashed",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        if (initialCredit > 0)
            user.Credit(initialCredit);
        return user;
    }

    [Fact]
    public void Credit_ZeroTo100_ShouldSetBalanceTo100()
    {
        var user = CreateUser();
        user.Credit(100m);
        ((decimal)user.WalletBalance).Should().Be(100m);
    }

    [Fact]
    public void Debit_100To50_ShouldSetBalanceTo50()
    {
        var user = CreateUser(100m);
        user.Debit(50m);
        ((decimal)user.WalletBalance).Should().Be(50m);
    }

    [Fact]
    public void Debit_150_From100_ShouldThrowInvalidOperationException()
    {
        var user = CreateUser(100m);
        var act = () => user.Debit(150m);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Block_80_From100_ShouldResultInWallet20Blocked80()
    {
        var user = CreateUser(100m);
        user.Block(80m);
        ((decimal)user.WalletBalance).Should().Be(20m);
        ((decimal)user.BlockedBalance).Should().Be(80m);
    }

    [Fact]
    public void Block_150_From100_ShouldThrowInvalidOperationException()
    {
        var user = CreateUser(100m);
        var act = () => user.Block(150m);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Unblock_30_With80Blocked_ShouldResultInWallet50Blocked50()
    {
        var user = CreateUser(100m);
        user.Block(80m);
        user.Unblock(30m);
        ((decimal)user.WalletBalance).Should().Be(50m);
        ((decimal)user.BlockedBalance).Should().Be(50m);
    }

    [Fact]
    public void ReleaseBlocked_80_With80Blocked_ShouldResultInBlocked0Wallet20()
    {
        var user = CreateUser(100m);
        user.Block(80m);
        user.ReleaseBlocked(80m);
        ((decimal)user.WalletBalance).Should().Be(20m);
        ((decimal)user.BlockedBalance).Should().Be(0m);
    }

    [Fact]
    public void ReleaseBlocked_100_With80Blocked_ShouldThrow()
    {
        var user = CreateUser(100m);
        user.Block(80m);

        var act = () => user.ReleaseBlocked(100m);
        act.Should().Throw<Exception>();
    }
}
