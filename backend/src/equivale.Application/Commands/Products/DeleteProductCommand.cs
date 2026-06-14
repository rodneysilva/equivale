using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Products;

public record DeleteProductCommand(string Id) : IRequest<bool>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IProductRepository _productRepository;

    public DeleteProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null) return false;

        await _productRepository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}
