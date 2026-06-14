using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;
using equivale.Application.Interfaces;
using equivale.Domain.Entities;

namespace equivale.Application.Queries.Users;

public record GetAllUsersQuery(PaginationParams Pagination) : IRequest<PagedResult<UserDto>>;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await ((IPaginatedRepository<Domain.Entities.User>)_userRepository)
            .GetPagedAsync(request.Pagination.Page, request.Pagination.PageSize, cancellationToken);

        return new PagedResult<UserDto>
        {
            Items = items.Select(_mapper.Map<UserDto>).ToList(),
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize,
            TotalItems = total
        };
    }
}
