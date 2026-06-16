namespace equivale.Domain.Entities;

public class Community
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string CreatorId { get; set; } = string.Empty;
    public List<string> Members { get; set; } = [];
    public List<string> Moderators { get; set; } = [];
    public string Type { get; set; } = "open";
    public string ProductVisibility { get; set; } = "public";
    public string? InviteCode { get; set; }
    /// <summary>Senha de uso único para entrar (null = desativada). Após uso, vira null.</summary>
    public string? OneTimePassword { get; set; }
    /// <summary>"open" = aprovação automática, "password" = senha única, "approval" = solicitação+aprovação</summary>
    public string JoinMode { get; set; } = "open";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public long Version { get; set; }
}
