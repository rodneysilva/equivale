using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface INotificationRepository : IBaseRepository<Notification>
{
    Task<(IReadOnlyList<Notification> Items, int Total)> GetByUserIdAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountUnreadAsync(string userId, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(string userId, CancellationToken cancellationToken = default);
}
