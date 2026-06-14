using equivale.Application.DTOs;

namespace equivale.Application.Interfaces.Services;

public interface IServiceService
{
    Task<ServiceDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<PagedResult<ServiceDto>> GetAllAsync(PaginationParams pagination, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServiceDto>> GetByProviderAsync(string providerId, CancellationToken cancellationToken = default);
    Task<ServiceDto> CreateAsync(CreateServiceDto dto, CancellationToken cancellationToken = default);
    Task<ServiceDto?> UpdateAsync(string id, CreateServiceDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}
