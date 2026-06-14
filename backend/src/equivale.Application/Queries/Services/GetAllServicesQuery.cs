using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Services;

public record GetAllServicesQuery : IRequest<IReadOnlyList<ServiceDto>>;

public class GetAllServicesQueryHandler : IRequestHandler<GetAllServicesQuery, IReadOnlyList<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IMapper _mapper;

    public GetAllServicesQueryHandler(IServiceRepository serviceRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ServiceDto>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
    {
        var services = await _serviceRepository.GetAllAsync(cancellationToken);
        return services.Select(_mapper.Map<ServiceDto>).ToList().AsReadOnly();
    }
}
