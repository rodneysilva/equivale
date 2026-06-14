using MongoDB.Driver;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class BaseRepository<T> : IBaseRepository<T> where T : class
{
    protected readonly IMongoCollection<T> _collection;

    public BaseRepository(MongoDbContext context)
    {
        var collectionName = typeof(T).Name.ToLowerInvariant() + "s";
        _collection = context.Database.GetCollection<T>(collectionName);
    }

    public virtual async Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        return await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var results = await _collection.Find(_ => true).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(entity, cancellationToken: cancellationToken);
    }

    public virtual async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        var idProp = typeof(T).GetProperty("Id");
        var idValue = idProp?.GetValue(entity)?.ToString();
        if (idValue is null) throw new InvalidOperationException("Entity must have an Id property.");

        var filter = Builders<T>.Filter.Eq("_id", idValue);
        await _collection.ReplaceOneAsync(filter, entity, cancellationToken: cancellationToken);
    }

    public virtual async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        await _collection.DeleteOneAsync(filter, cancellationToken);
    }
}
