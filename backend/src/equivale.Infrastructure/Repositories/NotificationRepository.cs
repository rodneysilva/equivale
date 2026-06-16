using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;
using MongoDB.Driver;

namespace equivale.Infrastructure.Repositories;

public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(MongoDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<Notification> Items, int Total)> GetByUserIdAsync(
        string userId, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<Notification>.Filter.Eq(n => n.UserId, userId);
        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var skip = (page - 1) * pageSize;
        var items = await _collection
            .Find(filter)
            .SortByDescending(n => n.CreatedAt)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(ct);
        return (items.AsReadOnly(), total);
    }

    public async Task<int> CountUnreadAsync(string userId, CancellationToken ct = default)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.UserId, userId),
            Builders<Notification>.Filter.Eq(n => n.Read, false));
        return (int)await _collection.CountDocumentsAsync(filter, cancellationToken: ct);
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.UserId, userId),
            Builders<Notification>.Filter.Eq(n => n.Read, false));
        var update = Builders<Notification>.Update.Set(n => n.Read, true);
        await _collection.UpdateManyAsync(filter, update, cancellationToken: ct);
    }
}
