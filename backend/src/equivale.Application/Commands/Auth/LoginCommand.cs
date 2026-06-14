using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Auth;

public record LoginCommand(LoginDto Login) : IRequest<AuthResponseDto>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;

    public LoginCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Login.Email.ToLowerInvariant(), cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Login.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponseDto(
            Token: string.Empty, // JWT will be generated in API layer
            UserId: user.Id,
            Email: user.Email,
            Name: user.Name,
            Role: user.Role
        );
    }
}
