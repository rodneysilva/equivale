using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;
using MongoDB.Driver;

namespace equivale.Infrastructure.Repositories;

public class PostRepository : BaseRepository<Post>, IPostRepository
{
    public PostRepository(MongoDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<Post> Items, int Total)> GetByCommunityIdAsync(
        string communityId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Post>.Filter.Eq(p => p.CommunityId, communityId);
        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }
}
