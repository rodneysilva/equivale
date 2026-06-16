using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IChatMessageRepository : IBaseRepository<ChatMessage>
{
    Task<IReadOnlyList<ChatMessage>> GetByTransactionIdAsync(
        string transactionId, CancellationToken cancellationToken = default);
}
