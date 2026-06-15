namespace equivale.Domain.Entities;

public class SocialLink
{
    public string Type { get; set; } = string.Empty; // e.g. "instagram", "github", "website"
    public string Url { get; set; } = string.Empty;
}
