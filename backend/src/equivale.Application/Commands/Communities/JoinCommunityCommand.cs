using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record JoinCommunityCommand(string CommunityId, string UserId) : IRequest<CommunityDto?>;

public class JoinCommunityCommandHandler : IRequestHandler<JoinCommunityCommand, CommunityDto?>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public JoinCommunityCommandHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<CommunityDto?> Handle(JoinCommunityCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.CommunityId, cancellationToken);
        if (community is null) return null;

        if (!community.Members.Contains(request.UserId))
        {
            community.Members.Add(request.UserId);
            community.UpdatedAt = DateTime.UtcNow;
            await _communityRepository.UpdateAsync(community, cancellationToken);
        }

        return _mapper.Map<CommunityDto>(community);
    }
}
