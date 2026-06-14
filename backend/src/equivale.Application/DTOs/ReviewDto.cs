namespace equivale.Application.DTOs;

public record ReviewDto(
    string Id,
    string ReviewerId,
    string TargetUserId,
    string ItemId,
    string ItemType,
    int Rating,
    string? Comment,
    DateTime CreatedAt);
