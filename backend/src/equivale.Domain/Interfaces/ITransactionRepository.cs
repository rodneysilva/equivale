using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface ITransactionRepository : IBaseRepository<Transaction>, ITransactionalRepository<Transaction>
{
    Task<(IReadOnlyList<Transaction> Items, int Total)> GetByUserIdAsync(
        string userId, string? role = null, int page = 1, int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Transaction>> GetByItemIdAsync(string itemId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Agrega contagem, volume e taxas das transações finalizadas em uma única
    /// passagem no MongoDB ($match Status Finished + $group), evitando carregar
    /// todos os documentos em memória.
    /// </summary>
    Task<(long CompletedTransactions, decimal TotalVolume, decimal TotalFeesCollected)> GetFinishedStatsAsync(
        CancellationToken cancellationToken = default);
}
