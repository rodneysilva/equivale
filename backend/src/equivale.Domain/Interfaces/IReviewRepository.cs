using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IReviewRepository : IBaseRepository<Review>
{
    Task<IReadOnlyList<Review>> GetByTargetUserIdAsync(string targetUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Review>> GetByItemIdAsync(string itemId, CancellationToken cancellationToken = default);
}
