using equivale.Domain.ValueObjects;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class EmailTests
{
    [Fact]
    public void Constructor_ValidEmail_ShouldCreateEmail()
    {
        var email = new Email("test@example.com");
        email.Address.Should().Be("test@example.com");
    }

    [Fact]
    public void Constructor_ShouldNormalizeToLowercase()
    {
        var email = new Email("Test@Example.COM");
        email.Address.Should().Be("test@example.com");
    }

    [Fact]
    public void Constructor_EmptyEmail_ShouldThrowArgumentException()
    {
        var act = () => new Email("");
        act.Should().Throw<ArgumentException>()
           .WithMessage("*Email cannot be empty*");
    }

    [Fact]
    public void Constructor_WhitespaceEmail_ShouldThrowArgumentException()
    {
        var act = () => new Email("   ");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_EmailWithoutAt_ShouldThrowArgumentException()
    {
        var act = () => new Email("invalidemail.com");
        act.Should().Throw<ArgumentException>()
           .WithMessage("*Invalid email format*");
    }

    [Fact]
    public void Constructor_EmailWithoutDomain_ShouldThrowArgumentException()
    {
        var act = () => new Email("invalid@");
        act.Should().Throw<ArgumentException>()
           .WithMessage("*Invalid email format*");
    }

    [Fact]
    public void Equals_SameEmails_ShouldBeEqual()
    {
        var email1 = new Email("test@example.com");
        var email2 = new Email("test@example.com");
        email1.Should().Be(email2);
        (email1 == email2).Should().BeTrue();
        (email1 != email2).Should().BeFalse();
    }

    [Fact]
    public void Equals_DifferentEmails_ShouldNotBeEqual()
    {
        var email1 = new Email("test@example.com");
        var email2 = new Email("other@example.com");
        email1.Should().NotBe(email2);
        (email1 != email2).Should().BeTrue();
    }

    [Fact]
    public void ImplicitConversion_ToString_ShouldReturnAddress()
    {
        var email = new Email("test@example.com");
        string address = email;
        address.Should().Be("test@example.com");
    }

    [Fact]
    public void ImplicitConversion_FromString_ShouldCreateEmail()
    {
        Email email = "test@example.com";
        email.Address.Should().Be("test@example.com");
    }
}
