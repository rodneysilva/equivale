using equivale.Application.DTOs;

namespace equivale.Application.Interfaces.Services;

public interface IProductService
{
    Task<ProductDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductDto>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto?> UpdateAsync(string id, CreateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}
