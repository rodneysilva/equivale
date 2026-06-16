using equivale.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/admin/moderation")]
[Authorize(Roles = "Admin")]
public class ModerationController : ControllerBase
{
    private readonly IPostRepository _postRepo;
    private readonly ICommentRepository _commentRepo;
    private readonly IUserRepository _userRepo;
    private readonly ICommunityRepository _communityRepo;

    public ModerationController(
        IPostRepository postRepo,
        ICommentRepository commentRepo,
        IUserRepository userRepo,
        ICommunityRepository communityRepo)
    {
        _postRepo = postRepo;
        _commentRepo = commentRepo;
        _userRepo = userRepo;
        _communityRepo = communityRepo;
    }

    // ---------- Posts ----------

    [HttpGet("posts")]
    public async Task<ActionResult<PagedResultDto<ModerationPostDto>>> ListPosts(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var (items, total) = await _postRepo.GetAllPagedAsync(page, pageSize, ct);

        var userMap = (await _userRepo.GetByIdsAsync(items.Select(p => p.AuthorId).Distinct(), ct))
            .ToDictionary(u => u.Id);
        var communityMap = (await _communityRepo.GetByIdsAsync(items.Select(p => p.CommunityId).Distinct(), ct))
            .ToDictionary(c => c.Id);

        var dtos = items.Select(p => new ModerationPostDto(
            p.Id,
            p.CommunityId,
            communityMap.TryGetValue(p.CommunityId, out var c) ? c.Name : null,
            p.AuthorId,
            userMap.TryGetValue(p.AuthorId, out var u) ? u.Name : null,
            userMap.TryGetValue(p.AuthorId, out var u2) ? u2.AvatarUrl : null,
            p.Content,
            p.CreatedAt,
            p.IsHidden,
            p.HiddenAt,
            p.HiddenBy
        )).ToList();

        return Ok(new PagedResultDto<ModerationPostDto>(dtos, page, pageSize, total));
    }

    [HttpPut("posts/{id}/hide")]
    public async Task<IActionResult> HidePost(string id, CancellationToken ct)
    {
        var adminId = User.GetUserIdOrThrow();
        var ok = await _postRepo.SetHiddenAsync(id, hidden: true, adminId, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPut("posts/{id}/unhide")]
    public async Task<IActionResult> UnhidePost(string id, CancellationToken ct)
    {
        var adminId = User.GetUserIdOrThrow();
        var ok = await _postRepo.SetHiddenAsync(id, hidden: false, adminId, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("posts/{id}")]
    public async Task<IActionResult> DeletePost(string id, CancellationToken ct)
    {
        await _postRepo.DeleteAsync(id, ct);
        return NoContent();
    }

    // ---------- Comments ----------

    [HttpGet("comments")]
    public async Task<ActionResult<PagedResultDto<ModerationCommentDto>>> ListComments(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var (items, total) = await _commentRepo.GetAllPagedAsync(page, pageSize, ct);

        var userMap = (await _userRepo.GetByIdsAsync(items.Select(c => c.AuthorId).Distinct(), ct))
            .ToDictionary(u => u.Id);
        var postMap = (await _postRepo.GetByIdsAsync(items.Select(c => c.PostId).Distinct(), ct))
            .ToDictionary(p => p.Id);
        var communityIds = postMap.Values.Select(p => p.CommunityId).Distinct();
        var communityMap = (await _communityRepo.GetByIdsAsync(communityIds, ct))
            .ToDictionary(c => c.Id);

        var dtos = items.Select(c =>
        {
            postMap.TryGetValue(c.PostId, out var post);
            var communityId = post?.CommunityId;
            return new ModerationCommentDto(
                c.Id,
                c.PostId,
                communityId,
                communityId is not null && communityMap.TryGetValue(communityId, out var com) ? com.Name : null,
                c.AuthorId,
                userMap.TryGetValue(c.AuthorId, out var u) ? u.Name : null,
                userMap.TryGetValue(c.AuthorId, out var u2) ? u2.AvatarUrl : null,
                c.ParentCommentId,
                c.Content,
                c.CreatedAt,
                c.IsHidden,
                c.HiddenAt,
                c.HiddenBy
            );
        }).ToList();

        return Ok(new PagedResultDto<ModerationCommentDto>(dtos, page, pageSize, total));
    }

    [HttpPut("comments/{id}/hide")]
    public async Task<IActionResult> HideComment(string id, CancellationToken ct)
    {
        var adminId = User.GetUserIdOrThrow();
        var ok = await _commentRepo.SetHiddenAsync(id, hidden: true, adminId, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPut("comments/{id}/unhide")]
    public async Task<IActionResult> UnhideComment(string id, CancellationToken ct)
    {
        var adminId = User.GetUserIdOrThrow();
        var ok = await _commentRepo.SetHiddenAsync(id, hidden: false, adminId, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(string id, CancellationToken ct)
    {
        await _commentRepo.DeleteAsync(id, ct);
        return NoContent();
    }
}
