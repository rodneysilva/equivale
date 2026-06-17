using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;
using MongoDB.Driver;

namespace equivale.Infrastructure.Repositories;

public class ChatMessageRepository : BaseRepository<ChatMessage>, IChatMessageRepository
{
    // Collection name "chatmessages" já é resolvido pelo BaseRepository
    // (typeof(ChatMessage).Name.ToLowerInvariant() + "s").
    public ChatMessageRepository(MongoDbContext context) : base(context) { }

    public async Task<IReadOnlyList<ChatMessage>> GetByTransactionIdAsync(
        string transactionId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<ChatMessage>.Filter.Eq(m => m.TransactionId, transactionId);
        var items = await _collection
            .Find(filter)
            .SortBy(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
        return items.AsReadOnly();
    }

    public async Task<long> CountUnreadAsync(string userId, IReadOnlyList<ChatUnreadScope> scopes, CancellationToken cancellationToken = default)
    {
        if (scopes.Count == 0) return 0;
        var orFilters = scopes.Select(s => (FilterDefinition<ChatMessage>)Builders<ChatMessage>.Filter.And(
            Builders<ChatMessage>.Filter.Eq(m => m.TransactionId, s.TransactionId),
            Builders<ChatMessage>.Filter.Ne(m => m.SenderId, userId),
            Builders<ChatMessage>.Filter.Gt(m => m.CreatedAt, s.SinceUtc)));
        return await _collection.CountDocumentsAsync(Builders<ChatMessage>.Filter.Or(orFilters), cancellationToken: cancellationToken);
    }
}
