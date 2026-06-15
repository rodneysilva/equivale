using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Application.Services;

namespace equivale.Application.Queries.Products;

public record GetAllProductsQuery(PaginationParams Pagination, string? SearchTerm = null, string? Category = null, string? Tag = null) : IRequest<PagedResult<ProductDto>>;

public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, PagedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly DtoEnricher _enricher;
    private readonly IMapper _mapper;

    public GetAllProductsQueryHandler(IProductRepository productRepository, DtoEnricher enricher, IMapper mapper)
    {
        _productRepository = productRepository;
        _enricher = enricher;
        _mapper = mapper;
    }

    public async Task<PagedResult<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _productRepository.GetPagedFilteredAsync(
            request.Pagination.Page, request.Pagination.PageSize, request.Category, request.SearchTerm, request.Tag, cancellationToken);

        var dtos = items.Select(_mapper.Map<ProductDto>).ToList();
        await _enricher.EnrichProductsAsync(dtos, cancellationToken);

        return new PagedResult<ProductDto>
        {
            Items = dtos,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
