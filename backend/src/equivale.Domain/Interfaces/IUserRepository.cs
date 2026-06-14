using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
