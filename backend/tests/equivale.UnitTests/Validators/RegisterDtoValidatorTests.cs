using equivale.Application.DTOs;
using equivale.Application.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace equivale.UnitTests.Validators;

public class RegisterDtoValidatorTests
{
    private readonly RegisterDtoValidator _validator = new();

    [Fact]
    public void Validate_ValidDto_ShouldNotHaveErrors()
    {
        var dto = new RegisterDto("John Doe", "john@example.com", "Pass1234");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyName_ShouldHaveError()
    {
        var dto = new RegisterDto("", "john@example.com", "Pass1234");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_InvalidEmail_ShouldHaveError()
    {
        var dto = new RegisterDto("John Doe", "invalid", "Pass1234");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public void Validate_ShortPassword_ShouldHaveError()
    {
        var dto = new RegisterDto("John Doe", "john@example.com", "Abc1");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Fact]
    public void Validate_PasswordWithoutUppercase_ShouldHaveError()
    {
        var dto = new RegisterDto("John Doe", "john@example.com", "pass1234");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_PasswordWithoutLowercase_ShouldHaveError()
    {
        var dto = new RegisterDto("John Doe", "john@example.com", "PASS1234");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_PasswordWithoutDigit_ShouldHaveError()
    {
        var dto = new RegisterDto("John Doe", "john@example.com", "Password");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }
}
