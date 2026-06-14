using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Auth;

public record RegisterCommand(RegisterDto Register) : IRequest<AuthResponseDto>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public RegisterCommandHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Register.Email, cancellationToken);
        if (existingUser is not null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new Domain.Entities.User
        {
            Name = request.Register.Name,
            Email = request.Register.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Register.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.Credit(100); // Welcome bonus: 100 EQL

        await _userRepository.AddAsync(user, cancellationToken);

        return new AuthResponseDto(
            Token: string.Empty, // JWT will be generated in API layer
            UserId: user.Id,
            Email: user.Email,
            Name: user.Name,
            Role: user.Role
        );
    }
}
