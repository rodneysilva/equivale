namespace equivale.Application.Interfaces;

/// <summary>
/// Capacidade de paginacao para queries de listagem.
/// Adicionado ao repositorio via composicao - nao polui o contrato base do dominio.
/// </summary>
public interface IPaginatedRepository<T> where T : class
{
    Task<(IReadOnlyList<T> Items, int Total)> GetPagedAsync(
        int page, int pageSize,
        CancellationToken cancellationToken = default);
}
