using MongoDB.Driver;
using equivale.Domain.Entities;
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
}
