using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Domain.Entities;

namespace equivale.Application.Queries.Services;

public record GetAllServicesQuery(PaginationParams Pagination, string? SearchTerm = null, string? Category = null) : IRequest<PagedResult<ServiceDto>>;

public class GetAllServicesQueryHandler : IRequestHandler<GetAllServicesQuery, PagedResult<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IMapper _mapper;

    public GetAllServicesQueryHandler(IServiceRepository serviceRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<ServiceDto>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _serviceRepository.GetPagedFilteredAsync(
            request.Pagination.Page, request.Pagination.PageSize, request.Category, request.SearchTerm, cancellationToken);

        return new PagedResult<ServiceDto>
        {
            Items = items.Select(_mapper.Map<ServiceDto>).ToList(),
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
