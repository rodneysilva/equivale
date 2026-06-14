using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(MongoDbContext context) : base(context)
    {
        _users = context.Users;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email.ToLowerInvariant());
        return await _users.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }
}
