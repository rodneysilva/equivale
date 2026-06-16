using AutoMapper;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record RemoveModeratorCommand(string CommunityId, string UserId) : IRequest;

public class RemoveModeratorCommandHandler : IRequestHandler<RemoveModeratorCommand>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;

    public RemoveModeratorCommandHandler(ICommunityRepository communityRepository, IUserRepository userRepository)
    {
        _communityRepository = communityRepository;
        _userRepository = userRepository;
    }

    public async Task Handle(RemoveModeratorCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.CommunityId, cancellationToken)
            ?? throw new KeyNotFoundException("Community not found");

        if (community.CreatorId == request.UserId)
            throw new InvalidOperationException("Cannot remove the community creator as moderator");

        community.Moderators.Remove(request.UserId);

        var removedUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (removedUser is not null)
            community.ModeratorNames.Remove(removedUser.Name);

        community.UpdatedAt = DateTime.UtcNow;
        await _communityRepository.UpdateAsync(community, cancellationToken);
    }
}
