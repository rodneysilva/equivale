namespace equivale.Domain.Entities;

public class Review
{
    public string Id { get; set; } = string.Empty;
    public string ReviewerId { get; set; } = string.Empty;
    public string TargetUserId { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string ItemId { get; set; } = string.Empty;
    public string ItemType { get; set; } = "Product";
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
