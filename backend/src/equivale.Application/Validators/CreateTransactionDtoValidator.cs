using equivale.Application.DTOs;
using FluentValidation;

namespace equivale.Application.Validators;

public class CreateTransactionDtoValidator : AbstractValidator<CreateTransactionDto>
{
    public CreateTransactionDtoValidator()
    {
        RuleFor(x => x.FromUserId)
            .NotEmpty().WithMessage("FromUserId is required.");

        RuleFor(x => x.ToUserId)
            .NotEmpty().WithMessage("ToUserId is required.")
            .NotEqual(x => x.FromUserId).WithMessage("Sender and recipient must be different.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.TransactionType)
            .NotEmpty().WithMessage("TransactionType is required.")
            .Must(type => type is "Purchase" or "Transfer" or "Bonus")
            .WithMessage("TransactionType must be Purchase, Transfer, or Bonus.");
    }
}
