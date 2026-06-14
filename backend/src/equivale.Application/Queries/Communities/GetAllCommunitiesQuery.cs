using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Domain.Entities;

namespace equivale.Application.Queries.Communities;

public record GetAllCommunitiesQuery(PaginationParams Pagination) : IRequest<PagedResult<CommunityDto>>;

public class GetAllCommunitiesQueryHandler : IRequestHandler<GetAllCommunitiesQuery, PagedResult<CommunityDto>>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public GetAllCommunitiesQueryHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<CommunityDto>> Handle(GetAllCommunitiesQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await ((IPaginatedRepository<Domain.Entities.Community>)_communityRepository)
            .GetPagedAsync(request.Pagination.Page, request.Pagination.PageSize, cancellationToken);

        return new PagedResult<CommunityDto>
        {
            Items = items.Select(_mapper.Map<CommunityDto>).ToList(),
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
