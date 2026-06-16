using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Application.Services;
using equivale.Domain.Entities;

namespace equivale.Application.Queries.Communities;

public record GetAllCommunitiesQuery(PaginationParams Pagination) : IRequest<PagedResult<CommunityDto>>;

public class GetAllCommunitiesQueryHandler : IRequestHandler<GetAllCommunitiesQuery, PagedResult<CommunityDto>>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly DtoEnricher _enricher;
    private readonly IMapper _mapper;

    public GetAllCommunitiesQueryHandler(ICommunityRepository communityRepository, DtoEnricher enricher, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _enricher = enricher;
        _mapper = mapper;
    }

    public async Task<PagedResult<CommunityDto>> Handle(GetAllCommunitiesQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await ((IPaginatedRepository<Domain.Entities.Community>)_communityRepository)
            .GetPagedAsync(request.Pagination.Page, request.Pagination.PageSize, cancellationToken);

        var dtos = items.Select(_mapper.Map<CommunityDto>).ToList();
        await _enricher.EnrichCommunitiesAsync(dtos, cancellationToken);

        return new PagedResult<CommunityDto>
        {
            Items = dtos,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
