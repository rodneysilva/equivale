namespace equivale.Domain.Entities;

public class Community
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? BannerUrl { get; set; }
    public string CreatorId { get; set; } = string.Empty;
    public List<string> Members { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
