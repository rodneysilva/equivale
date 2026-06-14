using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record LeaveCommunityCommand(string CommunityId, string UserId) : IRequest<CommunityDto?>;

public class LeaveCommunityCommandHandler : IRequestHandler<LeaveCommunityCommand, CommunityDto?>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public LeaveCommunityCommandHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<CommunityDto?> Handle(LeaveCommunityCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.CommunityId, cancellationToken);
        if (community is null) return null;

        community.Members.Remove(request.UserId);
        community.UpdatedAt = DateTime.UtcNow;
        await _communityRepository.UpdateAsync(community, cancellationToken);

        return _mapper.Map<CommunityDto>(community);
    }
}
