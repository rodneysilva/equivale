using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface ITransactionRepository : IBaseRepository<Transaction>, ITransactionalRepository<Transaction>
{
    Task<IReadOnlyList<Transaction>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
}
