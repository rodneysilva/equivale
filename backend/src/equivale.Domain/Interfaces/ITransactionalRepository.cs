namespace equivale.Domain.Interfaces;

/// <summary>
/// Extensao de repositorio que suporta operacoes dentro de uma sessao transacional.
/// Segue ISP - apenas repositorios que precisam de transacoes implementam isso.
/// </summary>
public interface ITransactionalRepository<T> where T : class
{
    Task AddAsync(T entity, IDbSession session, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, IDbSession session, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, IDbSession session, CancellationToken cancellationToken = default);
}
