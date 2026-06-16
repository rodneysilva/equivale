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
        // Conteúdo público exclui posts ocultos pela moderação.
        // Documentos legados (sem o campo IsHidden) são tratados como visíveis.
        var notHidden = Builders<Post>.Filter.Or(
            Builders<Post>.Filter.Eq(p => p.IsHidden, false),
            Builders<Post>.Filter.Exists(p => p.IsHidden, false));
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.CommunityId, communityId),
            notHidden);

        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    public async Task<(IReadOnlyList<Post> Items, int Total)> GetAllPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var total = (int)await _collection.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    public async Task<bool> SetHiddenAsync(
        string id, bool hidden, string hiddenBy, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var update = Builders<Post>.Update
            .Set(p => p.IsHidden, hidden)
            .Set(p => p.HiddenAt, hidden ? now : null)
            .Set(p => p.HiddenBy, hidden ? hiddenBy : null);
        var result = await _collection.UpdateOneAsync(
            Builders<Post>.Filter.Eq(p => p.Id, id), update, cancellationToken: cancellationToken);
        return result.MatchedCount > 0;
    }
}
