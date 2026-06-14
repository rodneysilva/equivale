using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class ReviewRepository : BaseRepository<Review>, IReviewRepository
{
    private readonly IMongoCollection<Review> _reviews;

    public ReviewRepository(MongoDbContext context) : base(context)
    {
        _reviews = context.Reviews;
    }

    public async Task<IReadOnlyList<Review>> GetByTargetUserIdAsync(string targetUserId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Review>.Filter.Eq(r => r.TargetUserId, targetUserId);
        var results = await _reviews.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public async Task<IReadOnlyList<Review>> GetByItemIdAsync(string itemId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Review>.Filter.Eq(r => r.ItemId, itemId);
        var results = await _reviews.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }
}
