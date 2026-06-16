using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;

namespace equivale.Application.Services;

public class UserActivityService : IUserActivityService
{
    private readonly IUserActivityRepository _repository;

    public UserActivityService(IUserActivityRepository repository)
    {
        _repository = repository;
    }

    public async Task LogAsync(
        string userId,
        ActivityType type,
        string? entityType = null,
        string? entityId = null,
        string? entityTitle = null,
        string? description = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        try
        {
            var activity = new UserActivity
            {
                UserId = userId,
                Type = type,
                EntityType = entityType,
                EntityId = entityId,
                EntityTitle = entityTitle,
                Description = description,
                CreatedAt = DateTime.UtcNow,
            };
            await _repository.AddAsync(activity, ct);
        }
        catch
        {
            // Fire-and-forget: falhas no log de atividade nunca devem quebrar a operação principal.
        }
    }

    public async Task<PagedResult<UserActivityDto>> GetByUserIdAsync(
        string userId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetByUserIdAsync(userId, page, pageSize, ct);

        var dtos = items
            .Select(a => new UserActivityDto(
                a.Id,
                a.Type.ToString(),
                a.EntityType,
                a.EntityId,
                a.EntityTitle,
                a.Description,
                a.CreatedAt))
            .ToList();

        return new PagedResult<UserActivityDto>
        {
            Items = dtos,
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }
}
