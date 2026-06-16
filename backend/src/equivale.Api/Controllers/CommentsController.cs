using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/communities/{communityId}/posts/{postId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentRepository _commentRepo;
    private readonly IPostRepository _postRepo;
    private readonly IUserRepository _userRepo;

    public CommentsController(ICommentRepository commentRepo, IPostRepository postRepo, IUserRepository userRepo)
    {
        _commentRepo = commentRepo;
        _postRepo = postRepo;
        _userRepo = userRepo;
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Token inválido.");

    [HttpGet]
    public async Task<ActionResult<List<CommentDto>>> GetAll(string communityId, string postId, CancellationToken ct)
    {
        // Valida que o post existe e pertence à comunidade informada
        var post = await _postRepo.GetByIdAsync(postId, ct);
        if (post is null || post.CommunityId != communityId)
            return NotFound();

        var (items, _) = await _commentRepo.GetByPostIdAsync(postId, 1, int.MaxValue, ct);

        // Enriquece com dados do autor
        var authorIds = items.Select(c => c.AuthorId).Distinct();
        var users = await _userRepo.GetByIdsAsync(authorIds, ct);
        var userMap = users.ToDictionary(u => u.Id);

        CommentDto ToDto(Comment c) => new CommentDto(
            c.Id, c.PostId, c.AuthorId,
            userMap.TryGetValue(c.AuthorId, out var u) ? u.Name : null,
            userMap.TryGetValue(c.AuthorId, out var u2) ? u2.AvatarUrl : null,
            c.ParentCommentId, c.Content, c.CreatedAt, new List<CommentDto>());

        var dtos = items.Select(ToDto).ToList();
        var byId = dtos.ToDictionary(d => d.Id);
        var roots = new List<CommentDto>();

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrWhiteSpace(dto.ParentCommentId) && byId.TryGetValue(dto.ParentCommentId, out var parent))
                parent.Replies.Add(dto);
            else
                roots.Add(dto);
        }

        return Ok(roots);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CommentDto>> Create(
        string communityId, string postId, [FromBody] CreateCommentDto dto, CancellationToken ct)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { error = "Conteúdo do comentário é obrigatório." });

        var post = await _postRepo.GetByIdAsync(postId, ct);
        if (post is null || post.CommunityId != communityId)
            return NotFound();

        var userId = GetUserId();

        // Se for resposta, valida que o comentário pai existe e pertence ao mesmo post
        if (!string.IsNullOrWhiteSpace(dto.ParentCommentId))
        {
            var parent = await _commentRepo.GetByIdAsync(dto.ParentCommentId, ct);
            if (parent is null || parent.PostId != postId)
                return BadRequest(new { error = "Comentário pai inválido." });
        }

        var comment = new Comment
        {
            PostId = postId,
            AuthorId = userId,
            ParentCommentId = string.IsNullOrWhiteSpace(dto.ParentCommentId) ? null : dto.ParentCommentId,
            Content = dto.Content.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        await _commentRepo.AddAsync(comment, ct);

        var user = await _userRepo.GetByIdAsync(userId, ct);
        var result = new CommentDto(
            comment.Id, comment.PostId, comment.AuthorId,
            user?.Name, user?.AvatarUrl,
            comment.ParentCommentId, comment.Content, comment.CreatedAt, new List<CommentDto>());

        return Ok(result);
    }

    [HttpDelete("{commentId}")]
    [Authorize]
    public async Task<IActionResult> Delete(string communityId, string postId, string commentId, CancellationToken ct)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId, ct);
        if (comment is null || comment.PostId != postId)
            return NotFound();

        // Valida consistência com a rota (post <-> comunidade)
        var post = await _postRepo.GetByIdAsync(postId, ct);
        if (post is null || post.CommunityId != communityId)
            return NotFound();

        var userId = GetUserId();
        if (comment.AuthorId != userId)
            return Forbid();

        await _commentRepo.DeleteAsync(commentId, ct);
        return NoContent();
    }
}
