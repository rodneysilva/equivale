using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;
using MongoDB.Driver;

namespace equivale.Infrastructure.Repositories;

public class UserActivityRepository : BaseRepository<UserActivity>, IUserActivityRepository
{
    public UserActivityRepository(MongoDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<UserActivity> Items, int Total)> GetByUserIdAsync(
        string userId, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<UserActivity>.Filter.Eq(a => a.UserId, userId);
        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var skip = (page - 1) * pageSize;
        var items = await _collection
            .Find(filter)
            .SortByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(ct);
        return (items.AsReadOnly(), total);
    }
}
