using System.IdentityModel.Tokens.Jwt;
using equivale.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _repo;

    public NotificationsController(INotificationRepository repo)
    {
        _repo = repo;
    }

    private string GetUserId() => User.GetUserIdOrThrow();

    [HttpGet]
    public async Task<ActionResult<PagedResult<NotificationDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var (items, total) = await _repo.GetByUserIdAsync(GetUserId(), page, pageSize, ct);
        var dtos = items.Select(n => new NotificationDto(
            n.Id, n.UserId, n.Type, n.EntityType, n.EntityId, n.Description, n.Read, n.CreatedAt)).ToList();
        return Ok(new PagedResult<NotificationDto> { Items = dtos, TotalItems = total, Page = page, PageSize = pageSize });
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountDto>> GetUnreadCount(CancellationToken ct)
    {
        var count = await _repo.CountUnreadAsync(GetUserId(), ct);
        return Ok(new UnreadCountDto(count));
    }

    [HttpPut("mark-read")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await _repo.MarkAllAsReadAsync(GetUserId(), ct);
        return NoContent();
    }
}

public record NotificationDto(
    string Id,
    string UserId,
    string Type,
    string? EntityType,
    string? EntityId,
    string? Description,
    bool Read,
    DateTime CreatedAt);

public record UnreadCountDto(int Count);
