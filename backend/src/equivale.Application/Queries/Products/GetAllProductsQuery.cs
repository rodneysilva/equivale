using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Domain.Entities;

namespace equivale.Application.Queries.Products;

public record GetAllProductsQuery(PaginationParams Pagination, string? SearchTerm = null, string? Category = null) : IRequest<PagedResult<ProductDto>>;

public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, PagedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetAllProductsQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _productRepository.GetPagedFilteredAsync(
            request.Pagination.Page, request.Pagination.PageSize, request.Category, request.SearchTerm, cancellationToken);

        return new PagedResult<ProductDto>
        {
            Items = items.Select(_mapper.Map<ProductDto>).ToList(),
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
