using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Products;

public record GetProductsBySellerQuery(string SellerId) : IRequest<IReadOnlyList<ProductDto>>;

public class GetProductsBySellerQueryHandler : IRequestHandler<GetProductsBySellerQuery, IReadOnlyList<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetProductsBySellerQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ProductDto>> Handle(GetProductsBySellerQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetBySellerIdAsync(request.SellerId, cancellationToken);
        return products.Select(_mapper.Map<ProductDto>).ToList().AsReadOnly();
    }
}
