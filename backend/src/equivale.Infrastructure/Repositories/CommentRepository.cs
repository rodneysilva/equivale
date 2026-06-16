using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;
using MongoDB.Driver;

namespace equivale.Infrastructure.Repositories;

public class CommentRepository : BaseRepository<Comment>, ICommentRepository
{
    public CommentRepository(MongoDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<Comment> Items, int Total)> GetByPostIdAsync(
        string postId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Comment>.Filter.Eq(c => c.PostId, postId);
        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(filter)
            .SortBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }
}
