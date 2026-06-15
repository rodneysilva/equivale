using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class ProductRepository : BaseRepository<Product>, IProductRepository
{
    private readonly IMongoCollection<Product> _products;

    public ProductRepository(MongoDbContext context) : base(context)
    {
        _products = context.Products;

        var textKey = new IndexKeysDefinitionBuilder<Product>()
            .Text(p => p.Title)
            .Text(p => p.Description)
            .Text(p => p.Category);
        _products.Indexes.CreateOne(
            new CreateIndexModel<Product>(textKey, new CreateIndexOptions { Background = true }));
    }

    public async Task<IReadOnlyList<Product>> GetBySellerIdAsync(string sellerId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.Eq(p => p.SellerId, sellerId);
        var results = await _products.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.Eq(p => p.Category, category);
        var results = await _products.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }

    public async Task<(IReadOnlyList<Product> Items, int Total)> GetPagedFilteredAsync(
        int page, int pageSize, string? category = null, string? searchTerm = null, List<string>? tags = null, string? sellerId = null, CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(category, searchTerm, tags, sellerId);
        var skip = (page - 1) * pageSize;
        var total = (int)await _products.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _products.Find(filter).Skip(skip).Limit(pageSize).ToListAsync(cancellationToken);
        return (items.AsReadOnly(), total);
    }

    private static FilterDefinition<Product> BuildFilter(string? category, string? searchTerm, List<string>? tags, string? sellerId)
    {
        var filters = new List<FilterDefinition<Product>>();

        if (!string.IsNullOrWhiteSpace(category))
            filters.Add(Builders<Product>.Filter.Eq(p => p.Category, category));

        if (!string.IsNullOrWhiteSpace(searchTerm))
            filters.Add(Builders<Product>.Filter.Text(searchTerm));

        if (tags is not null && tags.Count > 0)
            filters.Add(Builders<Product>.Filter.All(p => p.Tags, tags));

        if (!string.IsNullOrWhiteSpace(sellerId))
            filters.Add(Builders<Product>.Filter.Eq(p => p.SellerId, sellerId));

        return filters.Count == 0 ? Builders<Product>.Filter.Empty : Builders<Product>.Filter.And(filters);
    }
}
