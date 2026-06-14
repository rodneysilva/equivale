namespace equivale.Domain.Interfaces;

/// <summary>
/// Unit of Work para garantir atomicidade em operacoes multi-documento.
/// Abstracao pura do dominio - sem dependencia de MongoDB.
/// </summary>
public interface IUnitOfWork : IAsyncDisposable
{
    /// <summary>
    /// Executa uma operacao dentro de uma transacao de forma atomica.
    /// </summary>
    Task<TResult> ExecuteInTransactionAsync<TResult>(
        Func<IDbSession, CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Executa uma operacao dentro de uma transacao de forma atomica (sem retorno).
    /// </summary>
    Task ExecuteInTransactionAsync(
        Func<IDbSession, CancellationToken, Task> operation,
        CancellationToken cancellationToken = default);
}
