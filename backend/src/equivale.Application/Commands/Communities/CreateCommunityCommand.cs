using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record CreateCommunityCommand(CreateCommunityDto Community) : IRequest<CommunityDto>;

public class CreateCommunityCommandHandler : IRequestHandler<CreateCommunityCommand, CommunityDto>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public CreateCommunityCommandHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<CommunityDto> Handle(CreateCommunityCommand request, CancellationToken cancellationToken)
    {
        var community = _mapper.Map<Domain.Entities.Community>(request.Community);
        community.Members.Add(request.Community.CreatorId);
        community.Moderators.Add(request.Community.CreatorId);

        if (community.Type == "private")
        {
            community.InviteCode = GenerateInviteCode();
        }

        await _communityRepository.AddAsync(community, cancellationToken);
        return _mapper.Map<CommunityDto>(community);
    }

    private static string GenerateInviteCode() =>
        Guid.NewGuid().ToString("N").Substring(0, 8).ToUpperInvariant();
}
