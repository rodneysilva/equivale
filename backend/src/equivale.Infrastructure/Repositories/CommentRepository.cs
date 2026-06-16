using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;
using MongoDB.Driver;

namespace equivale.Infrastructure.Repositories;

public class CommentRepository : BaseRepository<Comment>, ICommentRepository
{
    public CommentRepository(MongoDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<Comment> Items, int Total)> GetByPostIdAsync(
        string postId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        // Conteúdo público exclui comentários ocultos pela moderação.
        // Documentos legados (sem o campo IsHidden) são tratados como visíveis.
        var notHidden = Builders<Comment>.Filter.Or(
            Builders<Comment>.Filter.Eq(c => c.IsHidden, false),
            Builders<Comment>.Filter.Exists(c => c.IsHidden, false));
        var filter = Builders<Comment>.Filter.And(
            Builders<Comment>.Filter.Eq(c => c.PostId, postId),
            notHidden);

        var total = (int)await _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(filter)
            .SortBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    public async Task<(IReadOnlyList<Comment> Items, int Total)> GetAllPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var total = (int)await _collection.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(_ => true)
            .SortByDescending(c => c.CreatedAt)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    public async Task<bool> SetHiddenAsync(
        string id, bool hidden, string hiddenBy, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var update = Builders<Comment>.Update
            .Set(c => c.IsHidden, hidden)
            .Set(c => c.HiddenAt, hidden ? now : null)
            .Set(c => c.HiddenBy, hidden ? hiddenBy : null);
        var result = await _collection.UpdateOneAsync(
            Builders<Comment>.Filter.Eq(c => c.Id, id), update, cancellationToken: cancellationToken);
        return result.MatchedCount > 0;
    }
}
