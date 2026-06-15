using MongoDB.Bson;
using MongoDB.Driver;
using equivale.Application.Interfaces;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class BaseRepository<T> : IBaseRepository<T>, ITransactionalRepository<T>, IPaginatedRepository<T> where T : class
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

    public virtual async Task<IReadOnlyList<T>> GetByIdsAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids?.Where(i => !string.IsNullOrWhiteSpace(i)).Distinct().ToList() ?? new List<string>();
        if (idList.Count == 0) return new List<T>().AsReadOnly();
        var filter = Builders<T>.Filter.In("_id", idList);
        var results = await _collection.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var results = await _collection.Find(_ => true).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        EnsureEntityHasId(entity);
        await _collection.InsertOneAsync(entity, cancellationToken: cancellationToken);
    }

    public virtual async Task AddAsync(T entity, IDbSession session, CancellationToken cancellationToken = default)
    {
        EnsureEntityHasId(entity);
        var mongoSession = ResolveMongoSession(session);
        await _collection.InsertOneAsync(mongoSession, entity, cancellationToken: cancellationToken);
    }

    public virtual async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        var idProp = typeof(T).GetProperty("Id");
        var idValue = idProp?.GetValue(entity)?.ToString();
        if (idValue is null) throw new InvalidOperationException("Entity must have an Id property.");

        var filter = Builders<T>.Filter.Eq("_id", idValue);
        await _collection.ReplaceOneAsync(filter, entity, cancellationToken: cancellationToken);
    }

    public virtual async Task UpdateAsync(T entity, IDbSession session, CancellationToken cancellationToken = default)
    {
        var mongoSession = ResolveMongoSession(session);
        var idProp = typeof(T).GetProperty("Id");
        var idValue = idProp?.GetValue(entity)?.ToString();
        if (idValue is null) throw new InvalidOperationException("Entity must have an Id property.");

        var filter = Builders<T>.Filter.Eq("_id", idValue);
        await _collection.ReplaceOneAsync(mongoSession, filter, entity, cancellationToken: cancellationToken);
    }

    public virtual async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        await _collection.DeleteOneAsync(filter, cancellationToken);
    }

    public virtual async Task DeleteAsync(string id, IDbSession session, CancellationToken cancellationToken = default)
    {
        var mongoSession = ResolveMongoSession(session);
        var filter = Builders<T>.Filter.Eq("_id", id);
        await _collection.DeleteOneAsync(mongoSession, filter, cancellationToken: cancellationToken);
    }

    public virtual async Task<(IReadOnlyList<T> Items, int Total)> GetPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var total = (int)await _collection.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        var items = await _collection
            .Find(_ => true)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    private static void EnsureEntityHasId(T entity)
    {
        ArgumentNullException.ThrowIfNull(entity);

        var idProperty = typeof(T).GetProperty("Id");
        if (idProperty?.CanWrite != true)
            return;

        var currentValue = idProperty.GetValue(entity)?.ToString();
        if (!string.IsNullOrWhiteSpace(currentValue))
            return;

        if (idProperty.PropertyType == typeof(string))
        {
            idProperty.SetValue(entity, ObjectId.GenerateNewId().ToString());
            return;
        }

        if (idProperty.PropertyType == typeof(ObjectId))
        {
            idProperty.SetValue(entity, ObjectId.GenerateNewId());
        }
    }

    private static IClientSessionHandle ResolveMongoSession(IDbSession session)
    {
        if (session is MongoDbSession mongoSession)
            return mongoSession.ClientSession;

        throw new ArgumentException("Session must be a MongoDbSession instance.", nameof(session));
    }
}
