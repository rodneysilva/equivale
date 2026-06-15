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
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? throw new UnauthorizedAccessException("Invalid token");

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto, CancellationToken ct)
    {
        try
        {
            var result = await _transactionService.CreateAsync(GetUserId(), dto, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TransactionDto>>> GetAll(
        [FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _transactionService.GetByUserIdAsync(GetUserId(), role, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(string id, CancellationToken ct)
    {
        var t = await _transactionService.GetByIdAsync(id, ct);
        if (t is null) return NotFound();
        return Ok(t);
    }

    [HttpPut("{id}/confirm-buyer")]
    public async Task<ActionResult<TransactionDto>> ConfirmByBuyer(string id, CancellationToken ct)
    {
        try
        {
            var t = await _transactionService.ConfirmByBuyerAsync(id, GetUserId(), ct);
            if (t is null) return NotFound();
            return Ok(t);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}/confirm-seller")]
    public async Task<ActionResult<TransactionDto>> ConfirmBySeller(string id, CancellationToken ct)
    {
        try
        {
            var t = await _transactionService.ConfirmBySellerAsync(id, GetUserId(), ct);
            if (t is null) return NotFound();
            return Ok(t);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<TransactionDto>> Cancel(string id, CancellationToken ct)
    {
        try
        {
            var t = await _transactionService.CancelAsync(id, GetUserId(), ct);
            if (t is null) return NotFound();
            return Ok(t);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
