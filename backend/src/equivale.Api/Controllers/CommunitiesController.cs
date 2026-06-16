using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunityService _communityService;
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;
    private readonly IBaseRepository<JoinRequest> _joinRequestRepo;
    private readonly IMediator _mediator;
    private readonly IUserActivityService _activityService;

    public CommunitiesController(ICommunityService communityService, ICommunityRepository communityRepository,
        IUserRepository userRepository, IBaseRepository<JoinRequest> joinRequestRepo, IMediator mediator, IUserActivityService activityService)
    {
        _communityService = communityService;
        _communityRepository = communityRepository;
        _userRepository = userRepository;
        _joinRequestRepo = joinRequestRepo;
        _mediator = mediator;
        _activityService = activityService;
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

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var community = await _communityService.GetByIdAsync(id, cancellationToken);
        if (community is null) return NotFound(new { error = "Comunidade não encontrada." });
        if (community.CreatorId != userId) return Forbid();

        await _communityService.DeleteAsync(id, cancellationToken);
        return NoContent();
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
        _ = _activityService.LogAsync(userId, ActivityType.CommunityCreated, "Community", community.Id, community.Name, "criou uma comunidade", cancellationToken);
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

    // Old Join removed - see new Join below with password/approval support

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

    /// <summary>
    /// Lista os membros de uma comunidade (requer ser membro ou criador).
    /// GET /api/communities/:id/members
    /// </summary>
    [HttpGet("{id}/members")]
    public async Task<ActionResult<List<CommunityMemberDto>>> GetMembers(string id, CancellationToken cancellationToken)
    {
        var community = await _communityRepository.GetByIdAsync(id, cancellationToken);
        if (community is null) return NotFound();

        var memberIds = community.Members.Union(new[] { community.CreatorId }).Distinct().ToList();

        var users = await _userRepository.GetByIdsAsync(memberIds, cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        var result = memberIds
            .Where(id => userMap.ContainsKey(id))
            .Select(mid => {
                var u = userMap[mid];
                return new CommunityMemberDto(
                    u.Id, u.Name, u.AvatarUrl, u.Bio,
                    community.CreatorId == mid,
                    community.Moderators.Contains(mid));
            })
            .ToList();

        return Ok(result);
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Token inválido.");

    /// <summary>
    /// Entra na comunidade. Para privadas: senha única OU solicita aprovação.
    /// POST /api/communities/:id/join
    /// Body: { "password": "xxx", "message": "texto" }
    /// </summary>
    [HttpPost("{id}/join")]
    [Authorize]
    public async Task<IActionResult> Join(string id, [FromBody] JoinRequestDto dto, CancellationToken ct)
    {
        var community = await _communityRepository.GetByIdAsync(id, ct);
        if (community is null) return NotFound(new { error = "Comunidade não encontrada." });

        var userId = GetUserId();
        if (community.Members.Contains(userId) || community.CreatorId == userId)
            return BadRequest(new { error = "Você já é membro desta comunidade." });

        if (community.Type == "open")
        {
            community.Members.Add(userId);
            await _communityRepository.UpdateAsync(community, ct);
            _ = _activityService.LogAsync(userId, ActivityType.CommunityJoined, "Community", community.Id, community.Name, "entrou na comunidade", ct);
            return Ok(new { joined = true, mode = "open" });
        }

        // Comunidade privada
        var mode = community.JoinMode ?? "approval";

        if (mode == "password")
        {
            if (string.IsNullOrWhiteSpace(community.OneTimePassword))
                return BadRequest(new { error = "Nenhuma senha ativa no momento. Solicite acesso." });

            if (dto.Password != community.OneTimePassword)
                return BadRequest(new { error = "Senha incorreta." });

            // Senha correta — entra e desativa a senha (uso único)
            community.Members.Add(userId);
            community.OneTimePassword = null; // Desativa após uso
            await _communityRepository.UpdateAsync(community, ct);
            _ = _activityService.LogAsync(userId, ActivityType.CommunityJoined, "Community", community.Id, community.Name, "entrou na comunidade", ct);
            return Ok(new { joined = true, mode = "password" });
        }

        // mode == "approval" — cria solicitação
        var existing = await _joinRequestRepo.GetAllAsync(ct);
        if (existing.Any(r => r.CommunityId == id && r.UserId == userId && r.Status == "Pending"))
            return BadRequest(new { error = "Você já tem uma solicitação pendente." });

        var request = new JoinRequest
        {
            CommunityId = id,
            UserId = userId,
            Message = dto.Message,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
        };
        await _joinRequestRepo.AddAsync(request, ct);
        return Ok(new { joined = false, mode = "approval", message = "Solicitação enviada. Aguarde aprovação." });
    }

    /// <summary>Lista solicitações pendentes (apenas owner/moderador)</summary>
    [HttpGet("{id}/join-requests")]
    [Authorize]
    public async Task<IActionResult> GetJoinRequests(string id, CancellationToken ct)
    {
        var community = await _communityRepository.GetByIdAsync(id, ct);
        if (community is null) return NotFound();

        var userId = GetUserId();
        if (community.CreatorId != userId && !community.Moderators.Contains(userId))
            return Forbid();

        var all = await _joinRequestRepo.GetAllAsync(ct);
        var pending = all.Where(r => r.CommunityId == id && r.Status == "Pending").ToList();

        var userIds = pending.Select(r => r.UserId).Distinct();
        var users = await _userRepository.GetByIdsAsync(userIds, ct);
        var userMap = users.ToDictionary(u => u.Id);

        var result = pending.Select(r => new
        {
            r.Id, r.UserId, r.Message, r.CreatedAt,
            Name = userMap.TryGetValue(r.UserId, out var u) ? u.Name : null,
            AvatarUrl = userMap.TryGetValue(r.UserId, out var u2) ? u2.AvatarUrl : null,
        }).ToList();

        return Ok(result);
    }

    /// <summary>Aprova solicitação de entrada</summary>
    [HttpPut("{id}/join-requests/{requestId}/approve")]
    [Authorize]
    public async Task<IActionResult> ApproveJoinRequest(string id, string requestId, CancellationToken ct)
    {
        var community = await _communityRepository.GetByIdAsync(id, ct);
        if (community is null) return NotFound();

        var userId = GetUserId();
        if (community.CreatorId != userId && !community.Moderators.Contains(userId))
            return Forbid();

        var request = await _joinRequestRepo.GetByIdAsync(requestId, ct);
        if (request is null || request.CommunityId != id || request.Status != "Pending")
            return NotFound();

        request.Status = "Approved";
        request.ReviewedBy = userId;
        request.ReviewedAt = DateTime.UtcNow;
        await _joinRequestRepo.UpdateAsync(request, ct);

        if (!community.Members.Contains(request.UserId))
        {
            community.Members.Add(request.UserId);
            await _communityRepository.UpdateAsync(community, ct);
        }

        return Ok(new { approved = true });
    }

    /// <summary>Rejeita solicitação de entrada</summary>
    [HttpPut("{id}/join-requests/{requestId}/reject")]
    [Authorize]
    public async Task<IActionResult> RejectJoinRequest(string id, string requestId, CancellationToken ct)
    {
        var community = await _communityRepository.GetByIdAsync(id, ct);
        if (community is null) return NotFound();

        var userId = GetUserId();
        if (community.CreatorId != userId && !community.Moderators.Contains(userId))
            return Forbid();

        var request = await _joinRequestRepo.GetByIdAsync(requestId, ct);
        if (request is null || request.CommunityId != id)
            return NotFound();

        request.Status = "Rejected";
        request.ReviewedBy = userId;
        request.ReviewedAt = DateTime.UtcNow;
        await _joinRequestRepo.UpdateAsync(request, ct);

        return Ok(new { rejected = true });
    }

    /// <summary>Gera nova senha de uso único (apenas owner/moderador)</summary>
    [HttpPost("{id}/generate-password")]
    [Authorize]
    public async Task<IActionResult> GeneratePassword(string id, CancellationToken ct)
    {
        var community = await _communityRepository.GetByIdAsync(id, ct);
        if (community is null) return NotFound();

        var userId = GetUserId();
        if (community.CreatorId != userId && !community.Moderators.Contains(userId))
            return Forbid();

        var password = Guid.NewGuid().ToString("N")[..8].ToUpper();
        community.OneTimePassword = password;
        community.JoinMode = "password";
        await _communityRepository.UpdateAsync(community, ct);

        return Ok(new { password, message = "Senha ativa até o primeiro uso." });
    }
}

public record JoinRequestDto(string? Password, string? Message);
public record CommunityMemberDto(string Id, string Name, string? AvatarUrl, string? Bio, bool IsOwner, bool IsModerator);
