using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class CreateTransactionDtoValidator : AbstractValidator<CreateTransactionDto>
{
    private static readonly HashSet<string> ValidItemTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Product", "Service"
    };

    public CreateTransactionDtoValidator()
    {
        RuleFor(x => x.ItemId)
            .NotEmpty().WithMessage("ItemId is required.");

        RuleFor(x => x.ItemType)
            .NotEmpty().WithMessage("ItemType is required.")
            .Must(BeValidItemType).WithMessage("ItemType must be 'Product' or 'Service'.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
    }

    private static bool BeValidItemType(string itemType) =>
        ValidItemTypes.Contains(itemType);
}
