using equivale.Application.DTOs;

namespace equivale.Application.Interfaces.Services;

public interface ITransactionService
{
    Task<TransactionDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TransactionDto>> GetByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto, CancellationToken cancellationToken = default);
}
