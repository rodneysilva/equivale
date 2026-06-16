namespace equivale.Application.DTOs;

public record CreateCommentDto(string Content, string? ParentCommentId);

public record CommentDto(
    string Id,
    string PostId,
    string AuthorId,
    string? AuthorName,
    string? AuthorAvatarUrl,
    string? ParentCommentId,
    string Content,
    DateTime CreatedAt,
    List<CommentDto> Replies);
