using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Products;

public record CreateProductCommand(CreateProductDto Product) : IRequest<ProductDto>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = _mapper.Map<Domain.Entities.Product>(request.Product);

        if (product.Tags is null || product.Tags.Count == 0)
        {
            product.Tags = TagGenerator.Generate(request.Product.Title, request.Product.Category, request.Product.Description);
        }

        await _productRepository.AddAsync(product, cancellationToken);
        return _mapper.Map<ProductDto>(product);
    }
}
