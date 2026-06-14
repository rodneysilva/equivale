using equivale.Application.DTOs;
using equivale.Application.Validators;
using FluentAssertions;

namespace equivale.UnitTests.Validators;

public class CreateTransactionDtoValidatorTests
{
    private readonly CreateTransactionDtoValidator _validator = new();

    [Fact]
    public void Validate_ValidDto_ShouldNotHaveErrors()
    {
        var dto = new CreateTransactionDto("user-1", "user-2", 50m, "Payment", "Purchase");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyFromUserId_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("", "user-2", 50m, "Payment", "Purchase");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FromUserId");
    }

    [Fact]
    public void Validate_SameFromAndToUser_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("user-1", "user-1", 50m, "Payment", "Purchase");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ToUserId");
    }

    [Fact]
    public void Validate_ZeroAmount_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("user-1", "user-2", 0m, "Payment", "Purchase");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount");
    }

    [Fact]
    public void Validate_InvalidTransactionType_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("user-1", "user-2", 50m, "Payment", "InvalidType");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "TransactionType");
    }
}
