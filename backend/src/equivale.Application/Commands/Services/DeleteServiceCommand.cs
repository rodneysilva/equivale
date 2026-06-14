using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Services;

public record DeleteServiceCommand(string Id) : IRequest<bool>;

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, bool>
{
    private readonly IServiceRepository _serviceRepository;

    public DeleteServiceCommandHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<bool> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (service is null) return false;

        await _serviceRepository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}
