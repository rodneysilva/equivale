using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Queries.Communities;
using equivale.Application.Commands.Communities;
using MediatR;

namespace equivale.Application.Services;

public class CommunityService : ICommunityService
{
    private readonly IMediator _mediator;

    public CommunityService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<CommunityDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetCommunityByIdQuery(id), cancellationToken);

    public async Task<PagedResult<CommunityDto>> GetAllAsync(PaginationParams pagination, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetAllCommunitiesQuery(pagination), cancellationToken);

    public async Task<CommunityDto> CreateAsync(CreateCommunityDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new CreateCommunityCommand(dto), cancellationToken);

    public async Task<CommunityDto?> UpdateAsync(string id, CreateCommunityDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new UpdateCommunityCommand(id, dto), cancellationToken);

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new DeleteCommunityCommand(id), cancellationToken);
    }

    public async Task JoinAsync(string communityId, string userId, CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new JoinCommunityCommand(communityId, userId), cancellationToken);
    }

    public async Task LeaveAsync(string communityId, string userId, CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new LeaveCommunityCommand(communityId, userId), cancellationToken);
    }
}
