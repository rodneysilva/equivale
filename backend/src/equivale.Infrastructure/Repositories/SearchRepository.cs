using MongoDB.Driver;
using equivale.Application.DTOs;
using equivale.Application.Interfaces;
using equivale.Domain.Entities;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

/// <summary>
/// Repositorio especializado para busca full-text em Products e Services.
/// Usa MongoDB Text Index para busca eficiente.
/// </summary>
public class SearchRepository
{
    private readonly IMongoCollection<Product> _products;
    private readonly IMongoCollection<Service> _services;

    public SearchRepository(MongoDbContext context)
    {
        _products = context.Database.GetCollection<Product>("products");
        _services = context.Database.GetCollection<Service>("services");

        EnsureTextIndexes();
    }

    private void EnsureTextIndexes()
    {
        var productKey = new IndexKeysDefinitionBuilder<Product>()
            .Text(p => p.Title)
            .Text(p => p.Description)
            .Text(p => p.Category);
        _products.Indexes.CreateOne(
            new CreateIndexModel<Product>(productKey,
                new CreateIndexOptions { Background = true }));

        var serviceKey = new IndexKeysDefinitionBuilder<Service>()
            .Text(s => s.Title)
            .Text(s => s.Description)
            .Text(s => s.Category);
        _services.Indexes.CreateOne(
            new CreateIndexModel<Service>(serviceKey,
                new CreateIndexOptions { Background = true }));
    }

    public async Task<PagedResult<ProductDto>> SearchProductsAsync(
        string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var filter = Builders<Product>.Filter.Text(searchTerm);

        var total = (int)await _products.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _products
            .Find(filter)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapProduct).ToList();
        return new PagedResult<ProductDto>
        {
            Items = dtos, Page = page, PageSize = pageSize, TotalItems = total
        };
    }

    public async Task<PagedResult<ServiceDto>> SearchServicesAsync(
        string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var skip = (page - 1) * pageSize;
        var filter = Builders<Service>.Filter.Text(searchTerm);

        var total = (int)await _services.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _services
            .Find(filter)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapService).ToList();
        return new PagedResult<ServiceDto>
        {
            Items = dtos, Page = page, PageSize = pageSize, TotalItems = total
        };
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
