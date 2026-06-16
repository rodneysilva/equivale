using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Services;
using equivale.Domain.Enums;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _svc;
    private readonly IUserActivityService _activityService;

    public TransactionsController(ITransactionService svc, IUserActivityService activityService)
    {
        _svc = svc;
        _activityService = activityService;
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Token inválido.");

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto, CancellationToken ct)
    {
        try
        {
            var transaction = await _svc.CreateAsync(GetUserId(), dto, ct);
            _ = _activityService.LogAsync(transaction.BuyerId, ActivityType.Purchase, "Transaction", transaction.Id, transaction.ItemTitle, "fez uma compra", ct);
            _ = _activityService.LogAsync(transaction.SellerId, ActivityType.Sale, "Transaction", transaction.Id, transaction.ItemTitle, "fez uma venda", ct);
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
        try { var t = await _svc.SellerConfirmOrderAsync(id, GetUserId(), ct); return t is null ? NotFound() : Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id}/ship")]
    public async Task<ActionResult<TransactionDto>> SellerShip(string id, [FromBody] ShipRequest? req, CancellationToken ct)
    {
        try { var t = await _svc.SellerShipAsync(id, GetUserId(), req?.TrackingInfo, ct); return t is null ? NotFound() : Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id}/confirm-delivery")]
    public async Task<ActionResult<TransactionDto>> BuyerConfirmDelivery(string id, CancellationToken ct)
    {
        try { var t = await _svc.BuyerConfirmDeliveryAsync(id, GetUserId(), ct); return t is null ? NotFound() : Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<TransactionDto>> Cancel(string id, CancellationToken ct)
    {
        try { var t = await _svc.CancelAsync(id, GetUserId(), ct); return t is null ? NotFound() : Ok(t); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }
}

public record ShipRequest(string? TrackingInfo);
