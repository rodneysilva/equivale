using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record UpdateCommunityCommand(string Id, UpdateCommunityDto Community) : IRequest<CommunityDto?>;

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

        if (request.Community.Name is not null)
            community.Name = request.Community.Name;
        if (request.Community.Description is not null)
            community.Description = request.Community.Description;
        if (request.Community.ImageUrl is not null)
            community.ImageUrl = request.Community.ImageUrl;
        if (request.Community.CoverUrl is not null)
            community.CoverUrl = request.Community.CoverUrl;
        if (request.Community.Type is not null)
            community.Type = request.Community.Type;
        if (request.Community.ProductVisibility is not null)
            community.ProductVisibility = request.Community.ProductVisibility;

        community.UpdatedAt = DateTime.UtcNow;
        await _communityRepository.UpdateAsync(community, cancellationToken);
        return _mapper.Map<CommunityDto>(community);
    }
}
