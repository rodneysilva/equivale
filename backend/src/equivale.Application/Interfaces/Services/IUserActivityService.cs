using equivale.Application.DTOs;
using equivale.Domain.Enums;

namespace equivale.Application.Interfaces.Services;

public interface IUserActivityService
{
    Task LogAsync(string userId, ActivityType type, string? entityType = null, string? entityId = null, string? entityTitle = null, string? description = null, CancellationToken ct = default);
    Task<PagedResult<UserActivityDto>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20, CancellationToken ct = default);
}
