using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunityService _communityService;
    private readonly ICommunityRepository _communityRepository;

    public CommunitiesController(ICommunityService communityService, ICommunityRepository communityRepository)
    {
        _communityService = communityService;
        _communityRepository = communityRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CommunityDto>>> GetAll(CancellationToken cancellationToken)
    {
        var communities = await _communityService.GetAllAsync(cancellationToken);
        return Ok(communities);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommunityDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var community = await _communityService.GetByIdAsync(id, cancellationToken);
        if (community is null) return NotFound();
        return Ok(community);
    }

    [HttpPost]
    public async Task<ActionResult<CommunityDto>> Create([FromBody] CreateCommunityDto dto, CancellationToken cancellationToken)
    {
        var community = await _communityService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = community.Id }, community);
    }

    [HttpPost("{id}/join")]
    public async Task<IActionResult> Join(string id, [FromQuery] string userId, CancellationToken cancellationToken)
    {
        await _communityService.JoinAsync(id, userId, cancellationToken);
        return NoContent();
    }

    [HttpGet("member/{userId}")]
    public async Task<ActionResult<IReadOnlyList<CommunityDto>>> GetByMember(string userId, CancellationToken cancellationToken)
    {
        var communities = await _communityRepository.GetByMemberIdAsync(userId, cancellationToken);
        return Ok(communities);
    }
}
