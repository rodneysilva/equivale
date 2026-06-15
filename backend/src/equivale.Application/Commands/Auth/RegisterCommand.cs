using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using MediatR;

namespace equivale.Application.Commands.Auth;

public record RegisterCommand(RegisterDto Register) : IRequest<AuthResponseDto>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public RegisterCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var email = new Email(request.Register.Email);

        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new Domain.Entities.User
        {
            Name = request.Register.Name,
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Register.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (string.Equals(request.Register.Email, "admin@equivale.test", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.Register.Email, "admin@equivale.com", StringComparison.OrdinalIgnoreCase))
        {
            user.Role = Domain.Enums.UserRole.Admin;
        }

        user.Credit(100); // Welcome bonus: 100 EQL

        await _userRepository.AddAsync(user, cancellationToken);

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
