using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Users;

public record GetAllUsersQuery : IRequest<IReadOnlyList<UserDto>>;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IReadOnlyList<UserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return users.Select(_mapper.Map<UserDto>).ToList().AsReadOnly();
    }
}
