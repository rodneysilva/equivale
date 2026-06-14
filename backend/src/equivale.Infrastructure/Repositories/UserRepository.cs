using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using equivale.Infrastructure.Persistence;

namespace equivale.Infrastructure.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(MongoDbContext context) : base(context)
    {
        _users = context.Users;
    }

    public async Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email);
        return await _users.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }
}
