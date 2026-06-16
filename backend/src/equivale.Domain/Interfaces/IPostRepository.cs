using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IPostRepository : IBaseRepository<Post>
{
    Task<(IReadOnlyList<Post> Items, int Total)> GetByCommunityIdAsync(
        string communityId, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Post> Items, int Total)> GetAllPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken = default);

    Task<bool> SetHiddenAsync(
        string id, bool hidden, string hiddenBy, CancellationToken cancellationToken = default);
}
