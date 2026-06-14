using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Services;

public record UpdateServiceCommand(string Id, CreateServiceDto Service) : IRequest<ServiceDto?>;

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, ServiceDto?>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IMapper _mapper;

    public UpdateServiceCommandHandler(IServiceRepository serviceRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _mapper = mapper;
    }

    public async Task<ServiceDto?> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (service is null) return null;

        service.Title = request.Service.Title;
        service.Description = request.Service.Description;
        service.Category = request.Service.Category;
        service.PriceInEquivale = request.Service.PriceInEquivale;
        service.Duration = request.Service.Duration;
        service.Location = request.Service.Location;
        service.UpdatedAt = DateTime.UtcNow;

        await _serviceRepository.UpdateAsync(service, cancellationToken);
        return _mapper.Map<ServiceDto>(service);
    }
}
