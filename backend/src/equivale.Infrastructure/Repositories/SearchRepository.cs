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

    public async Task<Dictionary<string, int>> GetProductCategoryCountsAsync(CancellationToken cancellationToken = default)
    {
        return await GetCategoryCountsAsync(_products, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetServiceCategoryCountsAsync(CancellationToken cancellationToken = default)
    {
        return await GetCategoryCountsAsync(_services, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetProductTagCountsAsync(CancellationToken cancellationToken = default)
    {
        return await GetTagCountsAsync(_products, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetServiceTagCountsAsync(CancellationToken cancellationToken = default)
    {
        return await GetTagCountsAsync(_services, cancellationToken);
    }

    private static async Task<Dictionary<string, int>> GetCategoryCountsAsync<T>(IMongoCollection<T> collection, CancellationToken ct)
    {
        var pipeline = new[]
        {
            new BsonDocument("$group", new BsonDocument { { "_id", "$Category" }, { "count", new BsonDocument("$sum", 1) } }),
            new BsonDocument("$sort", new BsonDocument("count", -1))
        };
        var results = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);
        return results.Where(r => r["_id"] != BsonNull.Value).ToDictionary(r => r["_id"].AsString, r => r["count"].AsInt32);
    }

    private static async Task<Dictionary<string, int>> GetTagCountsAsync<T>(IMongoCollection<T> collection, CancellationToken ct)
    {
        var pipeline = new[]
        {
            new BsonDocument("$unwind", "$Tags"),
            new BsonDocument("$group", new BsonDocument { { "_id", "$Tags" }, { "count", new BsonDocument("$sum", 1) } }),
            new BsonDocument("$sort", new BsonDocument("count", -1)),
            new BsonDocument("$limit", 20)
        };
        var results = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);
        return results.Where(r => r["_id"] != BsonNull.Value).ToDictionary(r => r["_id"].AsString, r => r["count"].AsInt32);
    }

    private static ProductDto MapProduct(Product p) => new(
        Id: p.Id, SellerId: p.SellerId, SellerName: null, SellerAvatarUrl: null, Title: p.Title,
        Description: p.Description, Category: p.Category,
        PriceInEquivale: (decimal)p.PriceInEquivale,
        Images: p.Images, Status: p.Status.ToString(),
        Condition: p.Condition.ToString(),
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
