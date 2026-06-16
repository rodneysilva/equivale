using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class CreateServiceDtoValidator : AbstractValidator<CreateServiceDto>
{
    public CreateServiceDtoValidator()
    {
        // ProviderId vem do token (controller derida do usuário autenticado); não validar no DTO.

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters.");

        RuleFor(x => x.PriceInEquivale)
            .GreaterThan(0).WithMessage("Price must be greater than zero.");

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters.")
            .When(x => x.Location is not null);
    }
}
