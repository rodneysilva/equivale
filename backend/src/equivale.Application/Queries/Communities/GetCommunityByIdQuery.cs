using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Communities;

public record GetCommunityByIdQuery(string Id) : IRequest<CommunityDto?>;

public class GetCommunityByIdQueryHandler : IRequestHandler<GetCommunityByIdQuery, CommunityDto?>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public GetCommunityByIdQueryHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<CommunityDto?> Handle(GetCommunityByIdQuery request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.Id, cancellationToken);
        return community is null ? null : _mapper.Map<CommunityDto>(community);
    }
}
