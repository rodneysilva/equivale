using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        // SellerId vem do token (controller deriva do usuário autenticado); não validar no DTO.

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

        RuleFor(x => x.Images)
            .ForEach(img => img.MaximumLength(500)).WithMessage("Image URL must not exceed 500 characters.")
            .When(x => x.Images is not null);
    }
}
