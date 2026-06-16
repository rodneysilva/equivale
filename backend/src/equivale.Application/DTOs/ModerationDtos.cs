namespace equivale.Application.DTOs;

public record ModerationPostDto(
    string Id,
    string CommunityId,
    string? CommunityName,
    string AuthorId,
    string? AuthorName,
    string? AuthorAvatarUrl,
    string Content,
    DateTime CreatedAt,
    bool IsHidden,
    DateTime? HiddenAt,
    string? HiddenBy);

public record ModerationCommentDto(
    string Id,
    string PostId,
    string? CommunityId,
    string? CommunityName,
    string AuthorId,
    string? AuthorName,
    string? AuthorAvatarUrl,
    string? ParentCommentId,
    string Content,
    DateTime CreatedAt,
    bool IsHidden,
    DateTime? HiddenAt,
    string? HiddenBy);
