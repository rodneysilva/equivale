using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class ServiceRepository : BaseRepository<Service>, IServiceRepository
{
    private readonly IMongoCollection<Service> _services;

    public ServiceRepository(MongoDbContext context) : base(context)
    {
        _services = context.Services;

        var textKey = new IndexKeysDefinitionBuilder<Service>()
            .Text(s => s.Title)
            .Text(s => s.Description)
            .Text(s => s.Category);
        _services.Indexes.CreateOne(
            new CreateIndexModel<Service>(textKey, new CreateIndexOptions { Background = true }));
    }

    public async Task<IReadOnlyList<Service>> GetByProviderIdAsync(string providerId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Service>.Filter.Eq(s => s.ProviderId, providerId);
        var results = await _services.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public async Task<IReadOnlyList<Service>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Service>.Filter.Eq(s => s.Category, category);
        var results = await _services.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public async Task<(IReadOnlyList<Service> Items, int Total)> GetPagedFilteredAsync(
        int page, int pageSize, string? category = null, string? searchTerm = null, List<string>? tags = null, string? providerId = null, string? communityId = null, CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(category, searchTerm, tags, providerId, communityId);
        var skip = (page - 1) * pageSize;
        var total = (int)await _services.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var sort = Builders<Service>.Sort.Descending(s => s.CreatedAt);
        var items = await _services.Find(filter).Sort(sort).Skip(skip).Limit(pageSize).ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    private static FilterDefinition<Service> BuildFilter(string? category, string? searchTerm, List<string>? tags, string? providerId, string? communityId)
    {
        var filters = new List<FilterDefinition<Service>>();

        if (!string.IsNullOrWhiteSpace(category))
            filters.Add(Builders<Service>.Filter.Eq(s => s.Category, category));

        if (!string.IsNullOrWhiteSpace(searchTerm))
            filters.Add(Builders<Service>.Filter.Text(searchTerm));

        if (tags is not null && tags.Count > 0)
            filters.Add(Builders<Service>.Filter.All(s => s.Tags, tags));

        if (!string.IsNullOrWhiteSpace(providerId))
            filters.Add(Builders<Service>.Filter.Eq(s => s.ProviderId, providerId));

        if (!string.IsNullOrWhiteSpace(communityId))
            filters.Add(Builders<Service>.Filter.Eq(s => s.CommunityId, communityId));

        return filters.Count == 0 ? Builders<Service>.Filter.Empty : Builders<Service>.Filter.And(filters);
    }
}
