using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

/// <summary>Escopo de contagem de mensagens não-lidas para uma transação.</summary>
public record ChatUnreadScope(string TransactionId, DateTime SinceUtc);

public interface IChatMessageRepository : IBaseRepository<ChatMessage>
{
    Task<IReadOnlyList<ChatMessage>> GetByTransactionIdAsync(
        string transactionId, CancellationToken cancellationToken = default);

    /// <summary>Conta mensagens não enviadas pelo usuário e posteriores a SinceUtc, por escopo (transação).</summary>
    Task<long> CountUnreadAsync(string userId, IReadOnlyList<ChatUnreadScope> scopes, CancellationToken cancellationToken = default);
}
