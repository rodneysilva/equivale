using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Queries.Reviews;
using equivale.Application.Commands.Reviews;
using MediatR;

namespace equivale.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IMediator _mediator;

    public ReviewService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ReviewDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetReviewByIdQuery(id), cancellationToken);

    public async Task<IReadOnlyList<ReviewDto>> GetByTargetUserAsync(string targetUserId, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetReviewsByTargetUserQuery(targetUserId), cancellationToken);

    public async Task<IReadOnlyList<ReviewDto>> GetByItemAsync(string itemId, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetReviewsByItemQuery(itemId), cancellationToken);

    public async Task<ReviewDto> CreateAsync(CreateReviewDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new CreateReviewCommand(dto), cancellationToken);
}
