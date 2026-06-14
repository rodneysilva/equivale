using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Commands.Auth;
using MediatR;

namespace equivale.Application.Services;

public class AuthService : IAuthService
{
    private readonly IMediator _mediator;

    public AuthService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new RegisterCommand(dto), cancellationToken);

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new LoginCommand(dto), cancellationToken);
}
