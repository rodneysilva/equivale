using equivale.Application.DTOs;
using equivale.Application.Validators;
using FluentAssertions;

namespace equivale.UnitTests.Validators;

public class CreateProductDtoValidatorTests
{
    private readonly CreateProductDtoValidator _validator = new();

    [Fact]
    public void Validate_ValidDto_ShouldNotHaveErrors()
    {
        var dto = new CreateProductDto("seller-1", "Product Title", "Description", "Category", 50m, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptySellerId_ShouldHaveError()
    {
        var dto = new CreateProductDto("", "Title", "Desc", "Cat", 50m, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "SellerId");
    }

    [Fact]
    public void Validate_EmptyTitle_ShouldHaveError()
    {
        var dto = new CreateProductDto("seller-1", "", "Desc", "Cat", 50m, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_ZeroPrice_ShouldHaveError()
    {
        var dto = new CreateProductDto("seller-1", "Title", "Desc", "Cat", 0m, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PriceInEquivale");
    }

    [Fact]
    public void Validate_NegativePrice_ShouldHaveError()
    {
        var dto = new CreateProductDto("seller-1", "Title", "Desc", "Cat", -10m, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }
}
