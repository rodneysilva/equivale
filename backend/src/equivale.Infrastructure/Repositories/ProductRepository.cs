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
}
