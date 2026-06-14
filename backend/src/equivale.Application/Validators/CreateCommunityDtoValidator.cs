using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class CreateCommunityDtoValidator : AbstractValidator<CreateCommunityDto>
{
    public CreateCommunityDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.CreatorId)
            .NotEmpty().WithMessage("CreatorId is required.");
    }
}
