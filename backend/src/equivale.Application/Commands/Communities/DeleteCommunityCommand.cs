using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Communities;

public record DeleteCommunityCommand(string Id) : IRequest<bool>;

public class DeleteCommunityCommandHandler : IRequestHandler<DeleteCommunityCommand, bool>
{
    private readonly ICommunityRepository _communityRepository;

    public DeleteCommunityCommandHandler(ICommunityRepository communityRepository)
    {
        _communityRepository = communityRepository;
    }

    public async Task<bool> Handle(DeleteCommunityCommand request, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(request.Id, cancellationToken);
        if (community is null) return false;

        await _communityRepository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}
