using System.IdentityModel.Tokens.Jwt;
using equivale.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/communities/{communityId}/posts")]
public class PostsController : ControllerBase
{
    private readonly IPostRepository _postRepo;
    private readonly IUserRepository _userRepo;
    private readonly IUserActivityService _activityService;

    public PostsController(IPostRepository postRepo, IUserRepository userRepo, IUserActivityService activityService)
    {
        _postRepo = postRepo;
        _userRepo = userRepo;
        _activityService = activityService;
    }

    private string GetUserId() => User.GetUserIdOrThrow();

    [HttpGet]
    public async Task<ActionResult> GetAll(string communityId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var (items, total) = await _postRepo.GetByCommunityIdAsync(communityId, page, pageSize, ct);

        var authorIds = items.Select(p => p.AuthorId).Distinct();
        var users = await _userRepo.GetByIdsAsync(authorIds, ct);
        var userMap = users.ToDictionary(u => u.Id);

        var dtos = items.Select(p => new PostDto(
            p.Id, p.CommunityId, p.AuthorId,
            userMap.TryGetValue(p.AuthorId, out var u) ? u.Name : null,
            userMap.TryGetValue(p.AuthorId, out var u2) ? u2.AvatarUrl : null,
            p.Content, p.CreatedAt
        )).ToList();

        var result = new PagedResultDto<PostDto>(dtos, page, pageSize, total);
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PostDto>> Create(string communityId, [FromBody] CreatePostDto dto, CancellationToken ct)
    {
        var userId = GetUserId();
        var post = new Domain.Entities.Post
        {
            CommunityId = communityId,
            AuthorId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
        };

        await _postRepo.AddAsync(post, ct);

        _ = _activityService.LogAsync(userId, ActivityType.PostCreated, "Post", post.Id, null, "publicou na comunidade", ct);

        var user = await _userRepo.GetByIdAsync(userId, ct);
        return CreatedAtAction(nameof(GetAll), new { communityId }, new PostDto(
            post.Id, post.CommunityId, post.AuthorId,
            user?.Name, user?.AvatarUrl,
            post.Content, post.CreatedAt));
    }

    [HttpDelete("{postId}")]
    [Authorize]
    public async Task<IActionResult> Delete(string communityId, string postId, CancellationToken ct)
    {
        var post = await _postRepo.GetByIdAsync(postId, ct);
        if (post is null || post.CommunityId != communityId)
            return NotFound();

        var userId = GetUserId();
        if (post.AuthorId != userId)
            return Forbid();

        await _postRepo.DeleteAsync(postId, ct);
        return NoContent();
    }
}

public record PagedResultDto<T>(List<T> Items, int Page, int PageSize, int TotalItems)
{
    public int TotalPages => (int)Math.Ceiling(TotalItems / (double)PageSize);
}
