namespace equivale.Domain.Interfaces;

/// <summary>
/// Abstracao de sessao transacional para o Domain.
/// Isola o dominio do tipo concreto IClientSessionHandle do MongoDB.
/// </summary>
public interface IDbSession : IAsyncDisposable
{
    /// <summary>
    /// Identificador unico da sessao (para debugging/logging).
    /// </summary>
    Guid SessionId { get; }

    /// <summary>
    /// Inicia uma transacao na sessao corrente.
    /// </summary>
    void StartTransaction();

    /// <summary>
    /// Inicia uma transacao na sessao corrente.
    /// </summary>
    Task StartTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Efetiva (commit) a transacao corrente.
    /// </summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Aborta (rollback) a transacao corrente.
    /// </summary>
    Task AbortTransactionAsync(CancellationToken cancellationToken = default);
}
