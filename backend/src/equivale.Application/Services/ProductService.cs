using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Queries.Products;
using equivale.Application.Commands.Products;
using MediatR;

namespace equivale.Application.Services;

public class ProductService : IProductService
{
    private readonly IMediator _mediator;

    public ProductService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ProductDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetProductByIdQuery(id), cancellationToken);

    public async Task<IReadOnlyList<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetAllProductsQuery(), cancellationToken);

    public async Task<IReadOnlyList<ProductDto>> GetBySellerAsync(string sellerId, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetProductsBySellerQuery(sellerId), cancellationToken);

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new CreateProductCommand(dto), cancellationToken);

    public async Task<ProductDto?> UpdateAsync(string id, CreateProductDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new UpdateProductCommand(id, dto), cancellationToken);

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new DeleteProductCommand(id), cancellationToken);
    }
}
