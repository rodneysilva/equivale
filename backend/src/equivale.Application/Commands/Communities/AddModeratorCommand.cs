using AutoMapper;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record AddModeratorCommand(string CommunityId, string UserId) : IRequest;

public class AddModeratorCommandHandler : IRequestHandler<AddModeratorCommand>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;

    public AddModeratorCommandHandler(ICommunityRepository communityRepository, IUserRepository userRepository)
    {
        _communityRepository = communityRepository;
        _userRepository = userRepository;
    }

    public async Task Handle(AddModeratorCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.CommunityId, cancellationToken)
            ?? throw new KeyNotFoundException("Community not found");

        if (!community.Moderators.Contains(request.UserId))
        {
            community.Moderators.Add(request.UserId);

            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user is not null && !community.ModeratorNames.Contains(user.Name))
                community.ModeratorNames.Add(user.Name);

            community.UpdatedAt = DateTime.UtcNow;
            await _communityRepository.UpdateAsync(community, cancellationToken);
        }
    }
}
