using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Services;

public record GetServicesByProviderQuery(string ProviderId) : IRequest<IReadOnlyList<ServiceDto>>;

public class GetServicesByProviderQueryHandler : IRequestHandler<GetServicesByProviderQuery, IReadOnlyList<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IMapper _mapper;

    public GetServicesByProviderQueryHandler(IServiceRepository serviceRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ServiceDto>> Handle(GetServicesByProviderQuery request, CancellationToken cancellationToken)
    {
        var services = await _serviceRepository.GetByProviderIdAsync(request.ProviderId, cancellationToken);
        return services.Select(_mapper.Map<ServiceDto>).ToList().AsReadOnly();
    }
}
