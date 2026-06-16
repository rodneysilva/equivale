using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IPostRepository : IBaseRepository<Post>
{
    Task<(IReadOnlyList<Post> Items, int Total)> GetByCommunityIdAsync(
        string communityId, int page, int pageSize, CancellationToken cancellationToken = default);
}
