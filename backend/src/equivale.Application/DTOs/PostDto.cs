namespace equivale.Application.DTOs;

public record CreatePostDto(string? CommunityId = null, string? AuthorId = null, string Content = "");

public record PostDto(
    string Id,
    string CommunityId,
    string AuthorId,
    string? AuthorName,
    string? AuthorAvatarUrl,
    string Content,
    DateTime CreatedAt);
