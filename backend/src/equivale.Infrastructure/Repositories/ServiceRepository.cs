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
}
