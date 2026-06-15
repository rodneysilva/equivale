using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface ITransactionRepository : IBaseRepository<Transaction>
{
    Task<(IReadOnlyList<Transaction> Items, int Total)> GetByUserIdAsync(
        string userId, string? role = null, int page = 1, int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Transaction>> GetByItemIdAsync(string itemId, CancellationToken cancellationToken = default);
}
