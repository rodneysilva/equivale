namespace equivale.Domain.Entities;

public class JoinRequest
{
    public string Id { get; set; } = string.Empty;
    public string CommunityId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
