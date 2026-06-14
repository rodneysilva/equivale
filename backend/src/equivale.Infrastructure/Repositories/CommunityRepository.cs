using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class CommunityRepository : BaseRepository<Community>, ICommunityRepository
{
    private readonly IMongoCollection<Community> _communities;

    public CommunityRepository(MongoDbContext context) : base(context)
    {
        _communities = context.Communities;
    }

    public async Task<Community?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Community>.Filter.Eq(c => c.Name, name);
        return await _communities.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Community>> GetByMemberIdAsync(string memberId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Community>.Filter.AnyEq(c => c.Members, memberId);
        var results = await _communities.Find(filter).ToListAsync(cancellationToken);
        return results.AsReadOnly();
    }
}
