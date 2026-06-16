namespace equivale.Domain.Entities;

public class Post
{
    public string Id { get; set; } = string.Empty;
    public string CommunityId { get; set; } = string.Empty;
    public string AuthorId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
