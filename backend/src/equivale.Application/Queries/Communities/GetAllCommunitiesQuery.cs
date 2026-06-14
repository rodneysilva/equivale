using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Communities;

public record GetAllCommunitiesQuery : IRequest<IReadOnlyList<CommunityDto>>;

public class GetAllCommunitiesQueryHandler : IRequestHandler<GetAllCommunitiesQuery, IReadOnlyList<CommunityDto>>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public GetAllCommunitiesQueryHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CommunityDto>> Handle(GetAllCommunitiesQuery request, CancellationToken cancellationToken)
    {
        var communities = await _communityRepository.GetAllAsync(cancellationToken);
        return communities.Select(_mapper.Map<CommunityDto>).ToList().AsReadOnly();
    }
}
