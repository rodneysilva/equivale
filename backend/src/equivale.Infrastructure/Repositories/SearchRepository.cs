using MongoDB.Bson;
using MongoDB.Driver;
using equivale.Application.DTOs;
using equivale.Application.Interfaces;
using equivale.Domain.Entities;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class SearchRepository
{
    private readonly IMongoCollection<Product> _products;
    private readonly IMongoCollection<Service> _services;

    public SearchRepository(MongoDbContext context)
    {
        _products = context.Database.GetCollection<Product>("products");
        _services = context.Database.GetCollection<Service>("services");
    }

    public async Task<List<Product>> SearchProductsRegexAsync(string searchTerm, int limit, CancellationToken cancellationToken = default)
    {
        var safeTerm = System.Text.RegularExpressions.Regex.Escape(searchTerm.Trim());
        var regex = new BsonRegularExpression(safeTerm, "i");
        var filter = Builders<Product>.Filter.Or(
            Builders<Product>.Filter.Regex(p => p.Title, regex),
            Builders<Product>.Filter.Regex(p => p.Description, regex),
            Builders<Product>.Filter.Regex(p => p.Category, regex),
            Builders<Product>.Filter.AnyEq(p => p.Tags, searchTerm.Trim().ToLowerInvariant()));
        return await _products.Find(filter).Limit(limit).ToListAsync(cancellationToken);
    }

    public async Task<List<Service>> SearchServicesRegexAsync(string searchTerm, int limit, CancellationToken cancellationToken = default)
    {
        var safeTerm = System.Text.RegularExpressions.Regex.Escape(searchTerm.Trim());
        var regex = new BsonRegularExpression(safeTerm, "i");
        var filter = Builders<Service>.Filter.Or(
            Builders<Service>.Filter.Regex(s => s.Title, regex),
            Builders<Service>.Filter.Regex(s => s.Description, regex),
            Builders<Service>.Filter.Regex(s => s.Category, regex),
            Builders<Service>.Filter.AnyEq(s => s.Tags, searchTerm.Trim().ToLowerInvariant()));
        return await _services.Find(filter).Limit(limit).ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<ProductDto>> SearchProductsAsync(
        string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var filter = Builders<Product>.Filter.Text(searchTerm);

        var total = (int)await _products.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _products.Find(filter).Skip(skip).Limit(pageSize).ToListAsync(cancellationToken);

        var dtos = items.Select(MapProduct).ToList();
        return new PagedResult<ProductDto> { Items = dtos, Page = page, PageSize = pageSize, TotalItems = total };
    }

    public async Task<PagedResult<ServiceDto>> SearchServicesAsync(
        string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var filter = Builders<Service>.Filter.Text(searchTerm);

        var total = (int)await _services.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _services.Find(filter).Skip(skip).Limit(pageSize).ToListAsync(cancellationToken);

        var dtos = items.Select(MapService).ToList();
        return new PagedResult<ServiceDto> { Items = dtos, Page = page, PageSize = pageSize, TotalItems = total };
    }

    public async Task<Dictionary<string, int>> GetProductCategoryCountsAsync(string? category = null, List<string>? tags = null, CancellationToken cancellationToken = default)
    {
        return await GetCategoryCountsAsync(_products, category, tags, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetServiceCategoryCountsAsync(string? category = null, List<string>? tags = null, CancellationToken cancellationToken = default)
    {
        return await GetCategoryCountsAsync(_services, category, tags, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetProductTagCountsAsync(string? category = null, List<string>? tags = null, CancellationToken cancellationToken = default)
    {
        return await GetTagCountsAsync(_products, category, tags, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetServiceTagCountsAsync(string? category = null, List<string>? tags = null, CancellationToken cancellationToken = default)
    {
        return await GetTagCountsAsync(_services, category, tags, cancellationToken);
    }

    private static FilterDefinition<T> BuildFacetFilter<T>(string? category, List<string>? tags)
    {
        var filters = new List<FilterDefinition<T>>();
        if (!string.IsNullOrWhiteSpace(category))
            filters.Add(Builders<T>.Filter.Eq("Category", category));
        if (tags is not null && tags.Count > 0)
            filters.Add(Builders<T>.Filter.All("Tags", tags));
        return filters.Count == 0 ? Builders<T>.Filter.Empty : Builders<T>.Filter.And(filters);
    }

    private static async Task<Dictionary<string, int>> GetCategoryCountsAsync<T>(IMongoCollection<T> collection, string? category, List<string>? tags, CancellationToken ct)
    {
        // Category counts: respect selected tags (refinement) but ignore selected category
        var matchFilter = BuildFacetFilter<T>(null, tags);
        var aggregate = collection.Aggregate().Match(matchFilter);
        var grouped = aggregate.Group(new BsonDocument { { "_id", "$Category" }, { "count", new BsonDocument("$sum", 1) } });
        var sorted = grouped.Sort(new BsonDocument("count", -1));
        var results = await sorted.ToListAsync(ct);
        return results.Where(r => r["_id"] != BsonNull.Value).ToDictionary(r => r["_id"].AsString, r => r["count"].AsInt32);
    }

    private static async Task<Dictionary<string, int>> GetTagCountsAsync<T>(IMongoCollection<T> collection, string? category, List<string>? tags, CancellationToken ct)
    {
        // Tag counts: respect BOTH selected category AND selected tags (cascade refinement)
        var matchFilter = BuildFacetFilter<T>(category, tags);
        var aggregate = collection.Aggregate().Match(matchFilter);
        var unwound = aggregate.Unwind("Tags");
        var grouped = unwound.Group(new BsonDocument { { "_id", "$Tags" }, { "count", new BsonDocument("$sum", 1) } });
        var sorted = grouped.Sort(new BsonDocument("count", -1)).Limit(20);
        var results = await sorted.ToListAsync(ct);
        return results.Where(r => r["_id"] != BsonNull.Value).ToDictionary(r => r["_id"].AsString, r => r["count"].AsInt32);
    }

    private static ProductDto MapProduct(Product p) => new(
        Id: p.Id, SellerId: p.SellerId, SellerName: null, SellerAvatarUrl: null, Title: p.Title,
        Description: p.Description, Category: p.Category,
        PriceInEquivale: (decimal)p.PriceInEquivale,
        Images: p.Images, Status: p.Status.ToString(),
        Condition: p.Condition.ToString(),
        Stock: p.Stock,
        CommunityId: p.CommunityId, CommunityName: null,
        Tags: p.Tags,
        CreatedAt: p.CreatedAt, UpdatedAt: p.UpdatedAt);

    private static ServiceDto MapService(Service s) => new(
        Id: s.Id, ProviderId: s.ProviderId, ProviderName: null, ProviderAvatarUrl: null, Title: s.Title,
        Description: s.Description, Category: s.Category,
        PriceInEquivale: (decimal)s.PriceInEquivale,
        Duration: s.Duration, Location: s.Location,
        Status: s.Status.ToString(),
        CommunityId: s.CommunityId, CommunityName: null,
        Tags: s.Tags,
        CreatedAt: s.CreatedAt, UpdatedAt: s.UpdatedAt);
}
