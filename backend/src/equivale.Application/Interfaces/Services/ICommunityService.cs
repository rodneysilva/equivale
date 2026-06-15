using equivale.Application.DTOs;

namespace equivale.Application.Interfaces.Services;

public interface ICommunityService
{
    Task<CommunityDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<PagedResult<CommunityDto>> GetAllAsync(PaginationParams pagination, CancellationToken cancellationToken = default);
    Task<CommunityDto> CreateAsync(CreateCommunityDto dto, CancellationToken cancellationToken = default);
    Task<CommunityDto?> UpdateAsync(string id, UpdateCommunityDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task JoinAsync(string communityId, string userId, string? inviteCode = null, CancellationToken cancellationToken = default);
    Task LeaveAsync(string communityId, string userId, CancellationToken cancellationToken = default);
    Task AddModeratorAsync(string communityId, string userId, CancellationToken cancellationToken = default);
    Task RemoveModeratorAsync(string communityId, string userId, CancellationToken cancellationToken = default);
}
