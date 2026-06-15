using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IProductRepository : IBaseRepository<Product>
{
    Task<IReadOnlyList<Product>> GetBySellerIdAsync(string sellerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Product> Items, int Total)> GetPagedFilteredAsync(
        int page, int pageSize, string? category = null, string? searchTerm = null, List<string>? tags = null, CancellationToken cancellationToken = default);
}
