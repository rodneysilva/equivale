using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunityService _communityService;
    private readonly ICommunityRepository _communityRepository;
    private readonly IMediator _mediator;

    public CommunitiesController(ICommunityService communityService, ICommunityRepository communityRepository, IMediator mediator)
    {
        _communityService = communityService;
        _communityRepository = communityRepository;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CommunityDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = new Application.Queries.Communities.GetAllCommunitiesQuery(new PaginationParams { Page = page, PageSize = pageSize });
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommunityDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var community = await _communityService.GetByIdAsync(id, cancellationToken);
        if (community is null) return NotFound();
        return Ok(community);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CommunityDto>> Create([FromBody] CreateCommunityDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token");
        dto = dto with { CreatorId = userId };
        var community = await _communityService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = community.Id }, community);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<CommunityDto>> Update(string id, [FromBody] UpdateCommunityDto dto, CancellationToken cancellationToken)
    {
        var community = await _communityService.UpdateAsync(id, dto, cancellationToken);
        if (community is null) return NotFound();
        return Ok(community);
    }

    [HttpPost("{id}/join")]
    [Authorize]
    public async Task<IActionResult> Join(string id, [FromQuery] string? inviteCode, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token");
        await _communityService.JoinAsync(id, userId, inviteCode, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id}/leave")]
    [Authorize]
    public async Task<IActionResult> Leave(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token");
        await _communityService.LeaveAsync(id, userId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id}/moderators")]
    [Authorize]
    public async Task<IActionResult> AddModerator(string id, [FromBody] AddModeratorDto dto, CancellationToken cancellationToken)
    {
        await _communityService.AddModeratorAsync(id, dto.UserId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}/moderators/{userId}")]
    [Authorize]
    public async Task<IActionResult> RemoveModerator(string id, string userId, CancellationToken cancellationToken)
    {
        await _communityService.RemoveModeratorAsync(id, userId, cancellationToken);
        return NoContent();
    }

    [HttpGet("member/{userId}")]
    public async Task<ActionResult<IReadOnlyList<CommunityDto>>> GetByMember(string userId, CancellationToken cancellationToken)
    {
        var communities = await _communityRepository.GetByMemberIdAsync(userId, cancellationToken);
        return Ok(communities);
    }
}
