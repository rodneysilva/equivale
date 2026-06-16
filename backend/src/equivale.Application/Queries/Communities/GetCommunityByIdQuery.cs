using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using equivale.Application.Services;
using MediatR;

namespace equivale.Application.Queries.Communities;

public record GetCommunityByIdQuery(string Id) : IRequest<CommunityDto?>;

public class GetCommunityByIdQueryHandler : IRequestHandler<GetCommunityByIdQuery, CommunityDto?>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly DtoEnricher _enricher;
    private readonly IMapper _mapper;

    public GetCommunityByIdQueryHandler(ICommunityRepository communityRepository, DtoEnricher enricher, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _enricher = enricher;
        _mapper = mapper;
    }

    public async Task<CommunityDto?> Handle(GetCommunityByIdQuery request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.Id, cancellationToken);
        if (community is null) return null;

        var dto = _mapper.Map<CommunityDto>(community);
        var list = new List<CommunityDto> { dto };
        await _enricher.EnrichCommunitiesAsync(list, cancellationToken);
        return list[0];
    }
}
