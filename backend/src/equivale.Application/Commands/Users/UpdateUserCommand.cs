using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Users;

public record UpdateUserCommand(string Id, UpdateUserDto User) : IRequest<UserDto?>;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto?>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UpdateUserCommandHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<UserDto?> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null) return null;

        if (request.User.Name is not null)
            user.Name = request.User.Name;
        if (request.User.AvatarUrl is not null)
            user.AvatarUrl = request.User.AvatarUrl;
        if (request.User.Bio is not null)
            user.Bio = request.User.Bio;
        if (request.User.SocialLinks is not null)
            user.SocialLinks = request.User.SocialLinks;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);
        return _mapper.Map<UserDto>(user);
    }
}
