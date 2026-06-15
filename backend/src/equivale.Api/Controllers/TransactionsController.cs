using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Services;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _svc;
    public TransactionsController(ITransactionService svc) => _svc = svc;

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Token inválido.");

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto, CancellationToken ct)
    {
        try { return Ok(await _svc.CreateAsync(GetUserId(), dto, ct)); }
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
