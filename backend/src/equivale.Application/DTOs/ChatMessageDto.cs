namespace equivale.Application.DTOs;

public record ChatMessageDto(
    string Id,
    string TransactionId,
    string SenderId,
    string? SenderName,
    string? SenderAvatarUrl,
    string Content,
    DateTime CreatedAt);

public record CreateChatMessageDto(string Content);
