using AutoMapper;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record RemoveModeratorCommand(string CommunityId, string UserId) : IRequest;

public class RemoveModeratorCommandHandler : IRequestHandler<RemoveModeratorCommand>
{
    private readonly ICommunityRepository _communityRepository;

    public RemoveModeratorCommandHandler(ICommunityRepository communityRepository)
    {
        _communityRepository = communityRepository;
    }

    public async Task Handle(RemoveModeratorCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.CommunityId, cancellationToken)
            ?? throw new KeyNotFoundException("Community not found");

        if (community.CreatorId == request.UserId)
            throw new InvalidOperationException("Cannot remove the community creator as moderator");

        community.Moderators.Remove(request.UserId);
        community.UpdatedAt = DateTime.UtcNow;
        await _communityRepository.UpdateAsync(community, cancellationToken);
    }
}
