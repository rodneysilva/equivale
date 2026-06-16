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
}
