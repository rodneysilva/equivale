using AutoMapper;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record AddModeratorCommand(string CommunityId, string UserId) : IRequest;

public class AddModeratorCommandHandler : IRequestHandler<AddModeratorCommand>
{
    private readonly ICommunityRepository _communityRepository;

    public AddModeratorCommandHandler(ICommunityRepository communityRepository)
    {
        _communityRepository = communityRepository;
    }

    public async Task Handle(AddModeratorCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.CommunityId, cancellationToken)
            ?? throw new KeyNotFoundException("Community not found");

        if (!community.Moderators.Contains(request.UserId))
        {
            community.Moderators.Add(request.UserId);
            community.UpdatedAt = DateTime.UtcNow;
            await _communityRepository.UpdateAsync(community, cancellationToken);
        }
    }
}
