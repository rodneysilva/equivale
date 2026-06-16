using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Api.Controllers;

public record UserCommunityDto(string Id, string Name, string? ImageUrl, int MembersCount, bool IsOwner, bool IsModerator);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IUserRepository _userRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IMediator _mediator;
    private readonly IUserActivityService _activityService;

    public UsersController(IUserService userService, IUserRepository userRepository, ICommunityRepository communityRepository, IMediator mediator, IUserActivityService activityService)
    {
        _userService = userService;
        _userRepository = userRepository;
        _communityRepository = communityRepository;
        _mediator = mediator;
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = new Application.Queries.Users.GetAllUsersQuery(new PaginationParams { Page = page, PageSize = pageSize });
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpGet("{id}/communities")]
    public async Task<ActionResult<List<UserCommunityDto>>> GetUserCommunities(string id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null) return NotFound();

        var communities = await _communityRepository.GetAllAsync(cancellationToken);
        var userCommunities = communities
            .Where(c => c.Members.Contains(id) || c.CreatorId == id)
            .Select(c => new UserCommunityDto(c.Id, c.Name, c.ImageUrl, c.Members.Count, c.CreatorId == id, c.Moderators.Contains(id)))
            .ToList();

        return Ok(userCommunities);
    }

    [HttpGet("{id}/activities")]
    public async Task<ActionResult<PagedResult<UserActivityDto>>> GetActivities(
        string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _activityService.GetByUserIdAsync(id, page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Update(string id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (id != userId && !User.IsInRole("Admin")) return Forbid();
        var user = await _userService.UpdateAsync(id, dto, cancellationToken);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (id != userId && !User.IsInRole("Admin")) return Forbid();

        var existing = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return NotFound();

        await _userRepository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Token inválido.");
}
