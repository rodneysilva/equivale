using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserDtoValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.")
            .When(x => x.Name is not null);

        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Bio must not exceed 500 characters.")
            .When(x => x.Bio is not null);
    }
}
