using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Application.Services;

namespace equivale.Application.Queries.Services;

public record GetAllServicesQuery(PaginationParams Pagination, string? SearchTerm = null, string? Category = null, List<string>? Tags = null, string? ProviderId = null, string? CommunityId = null) : IRequest<PagedResult<ServiceDto>>;

public class GetAllServicesQueryHandler : IRequestHandler<GetAllServicesQuery, PagedResult<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly DtoEnricher _enricher;
    private readonly IMapper _mapper;

    public GetAllServicesQueryHandler(IServiceRepository serviceRepository, DtoEnricher enricher, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _enricher = enricher;
        _mapper = mapper;
    }

    public async Task<PagedResult<ServiceDto>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _serviceRepository.GetPagedFilteredAsync(
            request.Pagination.Page, request.Pagination.PageSize, request.Category, request.SearchTerm, request.Tags, request.ProviderId, request.CommunityId, cancellationToken);

        var dtos = items.Select(_mapper.Map<ServiceDto>).ToList();
        await _enricher.EnrichServicesAsync(dtos, cancellationToken);

        return new PagedResult<ServiceDto>
        {
            Items = dtos,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
