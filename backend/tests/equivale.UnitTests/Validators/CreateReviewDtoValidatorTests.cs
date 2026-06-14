using equivale.Application.DTOs;
using equivale.Application.Validators;
using FluentAssertions;

namespace equivale.UnitTests.Validators;

public class CreateReviewDtoValidatorTests
{
    private readonly CreateReviewDtoValidator _validator = new();

    [Fact]
    public void Validate_ValidDto_ShouldNotHaveErrors()
    {
        var dto = new CreateReviewDto("reviewer-1", "target-1", "item-1", "Product", 4, "Great product");
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_RatingBelowOne_ShouldHaveError()
    {
        var dto = new CreateReviewDto("reviewer-1", "target-1", "item-1", "Product", 0, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Rating");
    }

    [Fact]
    public void Validate_RatingAboveFive_ShouldHaveError()
    {
        var dto = new CreateReviewDto("reviewer-1", "target-1", "item-1", "Product", 6, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Rating");
    }

    [Fact]
    public void Validate_SelfReview_ShouldHaveError()
    {
        var dto = new CreateReviewDto("user-1", "user-1", "item-1", "Product", 4, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "TargetUserId");
    }

    [Fact]
    public void Validate_InvalidItemType_ShouldHaveError()
    {
        var dto = new CreateReviewDto("reviewer-1", "target-1", "item-1", "InvalidType", 4, null);
        var result = _validator.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ItemType");
    }
}
