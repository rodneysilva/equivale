using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Products;

public record GetProductByIdQuery(string Id) : IRequest<ProductDto?>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly DtoEnricher _enricher;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandler(IProductRepository productRepository, DtoEnricher enricher, IMapper mapper)
    {
        _productRepository = productRepository;
        _enricher = enricher;
        _mapper = mapper;
    }

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null) return null;

        var dto = _mapper.Map<ProductDto>(product);
        await _enricher.EnrichProductsAsync(new List<ProductDto> { dto }, cancellationToken);
        return dto;
    }
}
