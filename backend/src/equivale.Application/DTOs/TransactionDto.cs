namespace equivale.Application.DTOs;

public record TransactionDto(
    string Id,
    string FromUserId,
    string ToUserId,
    decimal Amount,
    string Description,
    string TransactionType,
    string? RelatedItemId,
    DateTime CreatedAt);
