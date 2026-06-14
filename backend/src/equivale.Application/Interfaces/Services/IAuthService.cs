using equivale.Application.DTOs;

namespace equivale.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
}
