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
        _transactions = context.Transactions;
    }

    public async Task<IReadOnlyList<Transaction>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Transaction>.Filter.Or(
            Builders<Transaction>.Filter.Eq(t => t.FromUserId, userId),
            Builders<Transaction>.Filter.Eq(t => t.ToUserId, userId)
        );
        var results = await _transactions.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }
}
