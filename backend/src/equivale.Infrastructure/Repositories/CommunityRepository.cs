using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class CommunityRepository : BaseRepository<Community>, ICommunityRepository
{
    // Fixa o nome da coleção em "communities" (a derivação automática do BaseRepository
    // geraria "communitys"). Assim todos os métodos (herdados e próprios) usam a mesma coleção.
    public CommunityRepository(MongoDbContext context) : base(context, "communities") { }

    public async Task<Community?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Community>.Filter.Eq(c => c.Name, name);
        return await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Community>> GetByMemberIdAsync(string memberId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Community>.Filter.AnyEq(c => c.Members, memberId);
        var results = await _collection.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }
}
