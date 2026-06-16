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
        var dto = new CreateTransactionDto("item-123", "Product", 1, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyItemId_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("", "Product", 1, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ItemId");
    }

    [Fact]
    public void Validate_InvalidItemType_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("item-123", "Invalid", 1, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ItemType");
    }

    [Fact]
    public void Validate_EmptyItemType_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("item-123", "", 1, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ItemType");
    }

    [Fact]
    public void Validate_QuantityZero_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("item-123", "Product", 0, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Quantity");
    }

    [Fact]
    public void Validate_QuantityNegative_ShouldHaveError()
    {
        var dto = new CreateTransactionDto("item-123", "Product", -1, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Quantity");
    }
}
