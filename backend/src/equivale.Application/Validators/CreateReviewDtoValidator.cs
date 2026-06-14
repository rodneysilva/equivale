using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewDtoValidator()
    {
        RuleFor(x => x.ReviewerId)
            .NotEmpty().WithMessage("ReviewerId is required.");

        RuleFor(x => x.TargetUserId)
            .NotEmpty().WithMessage("TargetUserId is required.")
            .NotEqual(x => x.ReviewerId).WithMessage("Cannot review yourself.");

        RuleFor(x => x.ItemId)
            .NotEmpty().WithMessage("ItemId is required.");

        RuleFor(x => x.ItemType)
            .NotEmpty().WithMessage("ItemType is required.")
            .Must(type => type is "Product" or "Service")
            .WithMessage("ItemType must be Product or Service.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

        RuleFor(x => x.Comment)
            .MaximumLength(1000).WithMessage("Comment must not exceed 1000 characters.")
            .When(x => x.Comment is not null);
    }
}
