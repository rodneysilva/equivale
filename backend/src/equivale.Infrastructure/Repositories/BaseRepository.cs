using MongoDB.Bson;
using MongoDB.Driver;
using equivale.Application.Interfaces;
using equivale.Domain.Exceptions;
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

    public virtual Task<long> CountAsync(CancellationToken cancellationToken = default)
        => _collection.CountDocumentsAsync(Builders<T>.Filter.Empty, cancellationToken: cancellationToken);

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
        var (idFilter, versionFilter, newVersion) = BuildOptimisticLockFilter(entity);
        var combinedFilter = Builders<T>.Filter.And(idFilter, versionFilter);
        UpdateEntityVersion(entity, newVersion);

        var result = await _collection.ReplaceOneAsync(combinedFilter, entity, cancellationToken: cancellationToken);
        if (result.MatchedCount == 0)
            throw new ConcurrencyException(typeof(T).Name, GetEntityId(entity), newVersion - 1);
    }

    public virtual async Task UpdateAsync(T entity, IDbSession session, CancellationToken cancellationToken = default)
    {
        var mongoSession = ResolveMongoSession(session);
        var (idFilter, versionFilter, newVersion) = BuildOptimisticLockFilter(entity);
        var combinedFilter = Builders<T>.Filter.And(idFilter, versionFilter);
        UpdateEntityVersion(entity, newVersion);

        var result = await _collection.ReplaceOneAsync(mongoSession, combinedFilter, entity, cancellationToken: cancellationToken);
        if (result.MatchedCount == 0)
            throw new ConcurrencyException(typeof(T).Name, GetEntityId(entity), newVersion - 1);
    }

    public virtual async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        await _collection.DeleteOneAsync(filter, cancellationToken);
    }

    public virtual async Task DeleteAllAsync(CancellationToken cancellationToken = default)
    {
        await _collection.DeleteManyAsync(Builders<T>.Filter.Empty, cancellationToken);
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

    private static (FilterDefinition<T> idFilter, FilterDefinition<T> versionFilter, long newVersion) BuildOptimisticLockFilter(T entity)
    {
        var idProp = typeof(T).GetProperty("Id");
        var idValue = idProp?.GetValue(entity)?.ToString();
        if (idValue is null) throw new InvalidOperationException("Entity must have an Id property.");

        var versionProp = typeof(T).GetProperty("Version");
        var expectedVersion = versionProp is not null ? (long)versionProp.GetValue(entity)! : 0L;
        var newVersion = expectedVersion + 1;

        var idFilter = Builders<T>.Filter.Eq("_id", idValue);

        // Para documentos legados (sem campo Version), aceita Version==0 OU campo inexistente
        FilterDefinition<T> versionFilter;
        if (expectedVersion == 0)
        {
            versionFilter = Builders<T>.Filter.Or(
                Builders<T>.Filter.Eq("Version", 0L),
                Builders<T>.Filter.Exists("Version", false)
            );
        }
        else
        {
            versionFilter = Builders<T>.Filter.Eq("Version", expectedVersion);
        }

        return (idFilter, versionFilter, newVersion);
    }

    private static void UpdateEntityVersion(T entity, long newVersion)
    {
        var versionProp = typeof(T).GetProperty("Version");
        versionProp?.SetValue(entity, newVersion);
    }

    private static string GetEntityId(T entity)
    {
        var idProp = typeof(T).GetProperty("Id");
        return idProp?.GetValue(entity)?.ToString() ?? "unknown";
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
