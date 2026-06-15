using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Services;

public record GetServiceByIdQuery(string Id) : IRequest<ServiceDto?>;

public class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ServiceDto?>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly DtoEnricher _enricher;
    private readonly IMapper _mapper;

    public GetServiceByIdQueryHandler(IServiceRepository serviceRepository, DtoEnricher enricher, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _enricher = enricher;
        _mapper = mapper;
    }

    public async Task<ServiceDto?> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (service is null) return null;

        var dto = _mapper.Map<ServiceDto>(service);
        await _enricher.EnrichServicesAsync(new List<ServiceDto> { dto }, cancellationToken);
        return dto;
    }
}
