using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IUserActivityRepository : IBaseRepository<UserActivity>
{
    Task<(IReadOnlyList<UserActivity> Items, int Total)> GetByUserIdAsync(string userId, int page, int pageSize, CancellationToken ct = default);
}
