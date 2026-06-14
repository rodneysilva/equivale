using equivale.Domain.Entities;
using equivale.Domain.ValueObjects;

namespace equivale.Domain.Interfaces;

public interface IUserRepository : IBaseRepository<User>, ITransactionalRepository<User>
{
    Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default);
}
