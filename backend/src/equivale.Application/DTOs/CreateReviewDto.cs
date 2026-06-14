namespace equivale.Application.DTOs;

public record CreateReviewDto(
    string ReviewerId,
    string TargetUserId,
    string ItemId,
    string ItemType,
    int Rating,
    string? Comment = null);
