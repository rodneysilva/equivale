using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IServiceRepository : IBaseRepository<Service>
{
    Task<IReadOnlyList<Service>> GetByProviderIdAsync(string providerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Service>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Service> Items, int Total)> GetPagedFilteredAsync(
        int page, int pageSize, string? category = null, string? searchTerm = null, CancellationToken cancellationToken = default);
}
