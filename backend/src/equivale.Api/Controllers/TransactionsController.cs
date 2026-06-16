using System.IdentityModel.Tokens.Jwt;
using equivale.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _svc;
    private readonly IUserActivityService _activityService;
    private readonly INotificationRepository _notifications;

    public TransactionsController(ITransactionService svc, IUserActivityService activityService, INotificationRepository notifications)
    {
        _svc = svc;
        _activityService = activityService;
        _notifications = notifications;
    }

    private string GetUserId() => User.GetUserIdOrThrow();

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto, CancellationToken ct)
    {
        try
        {
            var transaction = await _svc.CreateAsync(GetUserId(), dto, ct);
            _ = _activityService.LogAsync(transaction.BuyerId, ActivityType.Purchase, "Transaction", transaction.Id, transaction.ItemTitle, "fez uma compra", ct);
            _ = _activityService.LogAsync(transaction.SellerId, ActivityType.Sale, "Transaction", transaction.Id, transaction.ItemTitle, "fez uma venda", ct);
            NotifyAsync(transaction.SellerId, "Purchase", "Transaction", transaction.Id,
                $"{transaction.BuyerName ?? "Alguém"} comprou seu item \"{transaction.ItemTitle}\"", ct);
            return Ok(transaction);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TransactionDto>>> GetAll(
        [FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _svc.GetByUserIdAsync(GetUserId(), role, page, pageSize, ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(string id, CancellationToken ct)
    {
        var t = await _svc.GetByIdAsync(id, ct);
        return t is null ? NotFound(new { error = "Transação não encontrada." }) : Ok(t);
    }

    [HttpPut("{id}/confirm-order")]
    public async Task<ActionResult<TransactionDto>> SellerConfirmOrder(string id, CancellationToken ct)
    {
        try { var t = await _svc.SellerConfirmOrderAsync(id, GetUserId(), ct); if (t is null) return NotFound();
            NotifyAsync(t.BuyerId, "OrderConfirmed", "Transaction", t.Id,
                $"{t.SellerName ?? "O vendedor"} confirmou seu pedido \"{t.ItemTitle}\"", ct);
            return Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id}/ship")]
    public async Task<ActionResult<TransactionDto>> SellerShip(string id, [FromBody] ShipRequest? req, CancellationToken ct)
    {
        try { var t = await _svc.SellerShipAsync(id, GetUserId(), req?.TrackingInfo, ct); if (t is null) return NotFound();
            NotifyAsync(t.BuyerId, "Shipped", "Transaction", t.Id,
                $"Seu pedido \"{t.ItemTitle}\" foi enviado" + (string.IsNullOrWhiteSpace(t.TrackingInfo) ? "" : $" (rastreio: {t.TrackingInfo})"), ct);
            return Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id}/confirm-delivery")]
    public async Task<ActionResult<TransactionDto>> BuyerConfirmDelivery(string id, CancellationToken ct)
    {
        try { var t = await _svc.BuyerConfirmDeliveryAsync(id, GetUserId(), ct); if (t is null) return NotFound();
            NotifyAsync(t.SellerId, "Delivered", "Transaction", t.Id,
                $"{t.BuyerName ?? "O comprador"} confirmou a entrega de \"{t.ItemTitle}\"", ct);
            return Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<TransactionDto>> Cancel(string id, CancellationToken ct)
    {
        try { var t = await _svc.CancelAsync(id, GetUserId(), ct); return t is null ? NotFound() : Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    private async Task NotifyAsync(string recipientId, string type, string entityType, string entityId, string description, CancellationToken ct)
    {
        var actorId = GetUserId();
        if (string.Equals(recipientId, actorId, StringComparison.Ordinal))
            return;
        _ = _notifications.AddAsync(new Notification
        {
            UserId = recipientId,
            Type = type,
            EntityType = entityType,
            EntityId = entityId,
            Description = description,
            Read = false,
            CreatedAt = DateTime.UtcNow,
        }, ct);
    }
}

public record ShipRequest(string? TrackingInfo);
