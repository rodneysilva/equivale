using equivale.Domain.Entities;

namespace equivale.Domain.Interfaces;

public interface ICommunityRepository : IBaseRepository<Community>
{
    Task<Community?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Community>> GetByMemberIdAsync(string memberId, CancellationToken cancellationToken = default);
}
