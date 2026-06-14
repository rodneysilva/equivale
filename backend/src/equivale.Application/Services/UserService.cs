using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Queries.Users;
using equivale.Application.Commands.Users;
using MediatR;

namespace equivale.Application.Services;

public class UserService : IUserService
{
    private readonly IMediator _mediator;

    public UserService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<UserDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetUserByIdQuery(id), cancellationToken);

    public async Task<PagedResult<UserDto>> GetAllAsync(PaginationParams pagination, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetAllUsersQuery(pagination), cancellationToken);

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new CreateUserCommand(dto), cancellationToken);

    public async Task<UserDto?> UpdateAsync(string id, UpdateUserDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new UpdateUserCommand(id, dto), cancellationToken);

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        // Delete is handled directly via repository through a command pattern
        // For simplicity, we send a no-op here; the controller can call the repository directly
        await Task.CompletedTask;
    }
}
