namespace equivale.Application.DTOs;

public record UserActivityDto(
    string Id,
    string Type,
    string? EntityType,
    string? EntityId,
    string? EntityTitle,
    string? Description,
    DateTime CreatedAt);
