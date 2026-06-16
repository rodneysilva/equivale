using MongoDB.Bson;
using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class TransactionRepository : BaseRepository<Transaction>, ITransactionRepository
{
    private readonly IMongoCollection<Transaction> _transactions;

    public TransactionRepository(MongoDbContext context) : base(context)
    {
        _transactions = context.Database.GetCollection<Transaction>("transactions");
    }

    public async Task<(IReadOnlyList<Transaction> Items, int Total)> GetByUserIdAsync(
        string userId, string? role = null, int page = 1, int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filters = new List<FilterDefinition<Transaction>>();

        if (role == "buyer")
            filters.Add(Builders<Transaction>.Filter.Eq(t => t.BuyerId, userId));
        else if (role == "seller")
            filters.Add(Builders<Transaction>.Filter.Eq(t => t.SellerId, userId));
        else
            filters.Add(Builders<Transaction>.Filter.Or(
                Builders<Transaction>.Filter.Eq(t => t.BuyerId, userId),
                Builders<Transaction>.Filter.Eq(t => t.SellerId, userId)));

        var filter = filters.Count == 0 ? Builders<Transaction>.Filter.Empty : Builders<Transaction>.Filter.And(filters);
        var skip = (page - 1) * pageSize;
        var total = (int)await _transactions.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var sort = Builders<Transaction>.Sort.Descending(t => t.CreatedAt);
        var items = await _transactions.Find(filter).Sort(sort).Skip(skip).Limit(pageSize).ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    public async Task<IReadOnlyList<Transaction>> GetByItemIdAsync(string itemId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Transaction>.Filter.Eq(t => t.ItemId, itemId);
        var results = await _transactions.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public async Task<(long CompletedTransactions, decimal TotalVolume, decimal TotalFeesCollected)> GetFinishedStatsAsync(
        CancellationToken cancellationToken = default)
    {
        // Status é serializado como int32 (enum sem convenção); Finished = 4.
        var match = new BsonDocument("$match", new BsonDocument("Status", (int)TransactionStatus.Finished));
        var group = new BsonDocument("$group", new BsonDocument
        {
            { "_id", BsonNull.Value },
            { "volume", new BsonDocument("$sum", "$TotalPrice") },
            { "fees", new BsonDocument("$sum", "$FeeAmount") },
            { "count", new BsonDocument("$sum", 1) }
        });

        var pipeline = new[] { match, group };
        using var cursor = await _transactions.AggregateAsync<BsonDocument>(pipeline, cancellationToken: cancellationToken);
        var doc = await cursor.FirstOrDefaultAsync(cancellationToken);

        if (doc is null)
            return (0, 0m, 0m);

        var completed = doc.Contains("count") ? (long)doc["count"].ToDouble() : 0L;
        var volume = doc.Contains("volume") ? doc["volume"].ToDecimal() : 0m;
        var fees = doc.Contains("fees") ? doc["fees"].ToDecimal() : 0m;
        return (completed, volume, fees);
    }
}
