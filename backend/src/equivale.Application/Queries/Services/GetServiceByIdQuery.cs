using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Services;

public record GetServiceByIdQuery(string Id) : IRequest<ServiceDto?>;

public class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ServiceDto?>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IMapper _mapper;

    public GetServiceByIdQueryHandler(IServiceRepository serviceRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _mapper = mapper;
    }

    public async Task<ServiceDto?> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        return service is null ? null : _mapper.Map<ServiceDto>(service);
    }
}
