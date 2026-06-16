using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions/{transactionId}/chat")]
public class ChatController : ControllerBase
{
    private readonly IChatMessageRepository _chatRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly IUserRepository _userRepo;
    private readonly INotificationRepository _notifications;

    public ChatController(
        IChatMessageRepository chatRepo,
        ITransactionRepository transactionRepo,
        IUserRepository userRepo,
        INotificationRepository notifications)
    {
        _chatRepo = chatRepo;
        _transactionRepo = transactionRepo;
        _userRepo = userRepo;
        _notifications = notifications;
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Token inválido.");

    private async Task<(Transaction Tx, string CurrentUserId, string OtherUserId)> ResolveAccessAsync(
        string transactionId, CancellationToken ct)
    {
        var tx = await _transactionRepo.GetByIdAsync(transactionId, ct);
        if (tx is null)
            throw new KeyNotFoundException("Transação não encontrada.");

        var userId = GetUserId();
        if (tx.BuyerId != userId && tx.SellerId != userId)
            throw new UnauthorizedAccessException("Você não tem acesso a esta transação.");

        var otherUserId = tx.BuyerId == userId ? tx.SellerId : tx.BuyerId;
        return (tx, userId, otherUserId);
    }

    [HttpGet]
    public async Task<ActionResult<List<ChatMessageDto>>> GetAll(string transactionId, CancellationToken ct)
    {
        try
        {
            var (_, userId, _) = await ResolveAccessAsync(transactionId, ct);
            var messages = await _chatRepo.GetByTransactionIdAsync(transactionId, ct);

            var senderIds = messages.Select(m => m.SenderId).Distinct();
            var users = await _userRepo.GetByIdsAsync(senderIds, ct);
            var userMap = users.ToDictionary(u => u.Id);

            ChatMessageDto ToDto(ChatMessage m) => new ChatMessageDto(
                m.Id,
                m.TransactionId,
                m.SenderId,
                userMap.TryGetValue(m.SenderId, out var u) ? u.Name : null,
                userMap.TryGetValue(m.SenderId, out var u2) ? u2.AvatarUrl : null,
                m.Content,
                m.CreatedAt);

            return Ok(messages.Select(ToDto).ToList());
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPost]
    public async Task<ActionResult<ChatMessageDto>> Send(
        string transactionId, [FromBody] CreateChatMessageDto dto, CancellationToken ct)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { error = "Conteúdo da mensagem é obrigatório." });

        try
        {
            var (tx, userId, otherUserId) = await ResolveAccessAsync(transactionId, ct);

            var message = new ChatMessage
            {
                TransactionId = transactionId,
                SenderId = userId,
                Content = dto.Content.Trim(),
                CreatedAt = DateTime.UtcNow,
            };

            await _chatRepo.AddAsync(message, ct);

            var sender = await _userRepo.GetByIdAsync(userId, ct);

            // Fire-and-forget: notifica o destinatário
            _ = _notifications.AddAsync(new Notification
            {
                UserId = otherUserId,
                Type = "ChatMessage",
                EntityType = "Transaction",
                EntityId = transactionId,
                Description = $"Nova mensagem sobre '{tx.ItemTitle}'",
                Read = false,
                CreatedAt = DateTime.UtcNow,
            }, ct);

            var result = new ChatMessageDto(
                message.Id,
                message.TransactionId,
                message.SenderId,
                sender?.Name,
                sender?.AvatarUrl,
                message.Content,
                message.CreatedAt);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }
}
