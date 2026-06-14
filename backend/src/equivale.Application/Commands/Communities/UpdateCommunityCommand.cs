using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record UpdateCommunityCommand(string Id, CreateCommunityDto Community) : IRequest<CommunityDto?>;

public class UpdateCommunityCommandHandler : IRequestHandler<UpdateCommunityCommand, CommunityDto?>
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IMapper _mapper;

    public UpdateCommunityCommandHandler(ICommunityRepository communityRepository, IMapper mapper)
    {
        _communityRepository = communityRepository;
        _mapper = mapper;
    }

    public async Task<CommunityDto?> Handle(UpdateCommunityCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.Id, cancellationToken);
        if (community is null) return null;

        community.Name = request.Community.Name;
        community.Description = request.Community.Description;
        if (request.Community.BannerUrl is not null)
            community.BannerUrl = request.Community.BannerUrl;
        community.UpdatedAt = DateTime.UtcNow;

        await _communityRepository.UpdateAsync(community, cancellationToken);
        return _mapper.Map<CommunityDto>(community);
    }
}
