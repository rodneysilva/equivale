using equivale.Application.DTOs;

namespace equivale.Application.Interfaces.Services;

public interface IReviewService
{
    Task<ReviewDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ReviewDto>> GetByTargetUserAsync(string targetUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ReviewDto>> GetByItemAsync(string itemId, CancellationToken cancellationToken = default);
    Task<ReviewDto> CreateAsync(CreateReviewDto dto, CancellationToken cancellationToken = default);
}
