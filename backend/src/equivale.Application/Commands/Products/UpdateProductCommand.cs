using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Products;

public record UpdateProductCommand(string Id, CreateProductDto Product) : IRequest<ProductDto?>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto?> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null) return null;

        product.Title = request.Product.Title;
        product.Description = request.Product.Description;
        product.Category = request.Product.Category;
        product.PriceInEquivale = request.Product.PriceInEquivale;
        if (request.Product.Images is not null)
            product.Images = request.Product.Images;
        product.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateAsync(product, cancellationToken);
        return _mapper.Map<ProductDto>(product);
    }
}
