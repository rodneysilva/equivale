using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Services;

public record CreateServiceCommand(CreateServiceDto Service) : IRequest<ServiceDto>;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, ServiceDto>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IMapper _mapper;

    public CreateServiceCommandHandler(IServiceRepository serviceRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _mapper = mapper;
    }

    public async Task<ServiceDto> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = _mapper.Map<Domain.Entities.Service>(request.Service);
        await _serviceRepository.AddAsync(service, cancellationToken);
        return _mapper.Map<ServiceDto>(service);
    }
}
