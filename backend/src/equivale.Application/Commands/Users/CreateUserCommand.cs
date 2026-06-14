using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Users;

public record CreateUserCommand(CreateUserDto User) : IRequest<UserDto>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public CreateUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = _mapper.Map<Domain.Entities.User>(request.User);
        user.PasswordHash = _passwordHasher.Hash(request.User.Password);
        user.Credit(100); // Bonus wallet balance

        await _userRepository.AddAsync(user, cancellationToken);
        return _mapper.Map<UserDto>(user);
    }
}
