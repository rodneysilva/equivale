using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Products;

public record GetAllProductsQuery : IRequest<IReadOnlyList<ProductDto>>;

public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, IReadOnlyList<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetAllProductsQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetAllAsync(cancellationToken);
        return products.Select(_mapper.Map<ProductDto>).ToList().AsReadOnly();
    }
}
