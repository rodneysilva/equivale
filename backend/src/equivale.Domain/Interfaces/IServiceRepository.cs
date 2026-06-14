using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IServiceRepository : IBaseRepository<Service>
{
    Task<IReadOnlyList<Service>> GetByProviderIdAsync(string providerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Service>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
}
