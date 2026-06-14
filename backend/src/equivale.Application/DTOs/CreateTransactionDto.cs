namespace equivale.Application.DTOs;

public record CreateTransactionDto(
    string FromUserId,
    string ToUserId,
    decimal Amount,
    string Description,
    string TransactionType,
    string? RelatedItemId = null);
