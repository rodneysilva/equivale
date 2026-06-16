using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Services;

public record CreateServiceCommand(CreateServiceDto Service) : IRequest<ServiceDto>;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, ServiceDto>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public CreateServiceCommandHandler(IServiceRepository serviceRepository, IUserRepository userRepository,
        ICommunityRepository communityRepository, IMapper mapper)
    {
        _serviceRepository = serviceRepository;
        _userRepository = userRepository;
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<ServiceDto> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = _mapper.Map<Domain.Entities.Service>(request.Service);

        if (service.Tags is null || service.Tags.Count == 0)
        {
            service.Tags = TagGenerator.Generate(request.Service.Title, request.Service.Category, request.Service.Description);
        }

        var provider = await _userRepository.GetByIdAsync(request.Service.ProviderId, cancellationToken);
        if (provider is not null)
        {
            service.ProviderName = provider.Name;
            service.ProviderAvatarUrl = provider.AvatarUrl;
        }

        if (!string.IsNullOrWhiteSpace(service.CommunityId))
        {
            var community = await _communityRepository.GetByIdAsync(service.CommunityId, cancellationToken);
            service.CommunityName = community?.Name;
        }

        await _serviceRepository.AddAsync(service, cancellationToken);
        return _mapper.Map<ServiceDto>(service);
    }
}
