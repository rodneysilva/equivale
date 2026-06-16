using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface ICommentRepository : IBaseRepository<Comment>
{
    Task<(IReadOnlyList<Comment> Items, int Total)> GetByPostIdAsync(
        string postId, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Comment> Items, int Total)> GetAllPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken = default);

    Task<bool> SetHiddenAsync(
        string id, bool hidden, string hiddenBy, CancellationToken cancellationToken = default);
}
