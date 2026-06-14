using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Queries.Services;
using equivale.Application.Commands.Services;
using MediatR;

namespace equivale.Application.Services;

public class ServiceService : IServiceService
{
    private readonly IMediator _mediator;

    public ServiceService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ServiceDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetServiceByIdQuery(id), cancellationToken);

    public async Task<IReadOnlyList<ServiceDto>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetAllServicesQuery(), cancellationToken);

    public async Task<IReadOnlyList<ServiceDto>> GetByProviderAsync(string providerId, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetServicesByProviderQuery(providerId), cancellationToken);

    public async Task<ServiceDto> CreateAsync(CreateServiceDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new CreateServiceCommand(dto), cancellationToken);

    public async Task<ServiceDto?> UpdateAsync(string id, CreateServiceDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new UpdateServiceCommand(id, dto), cancellationToken);

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new DeleteServiceCommand(id), cancellationToken);
    }
}
