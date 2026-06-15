using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using MediatR;

namespace equivale.Application.Commands.Auth;

public record LoginCommand(LoginDto Login) : IRequest<AuthResponseDto>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public LoginCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = new Email(request.Login.Email);

        var user = await _userRepository.GetByEmailAsync(email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!_passwordHasher.Verify(request.Login.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponseDto(
            Token: string.Empty,
            UserId: user.Id,
            Email: user.Email.Address,
            Name: user.Name,
            Role: user.Role,
            WalletBalance: user.WalletBalance.Amount
        );
    }
}
