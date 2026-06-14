using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var transaction = await _transactionService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IReadOnlyList<TransactionDto>>> GetByUser(string userId, CancellationToken cancellationToken)
    {
        var transactions = await _transactionService.GetByUserAsync(userId, cancellationToken);
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var transaction = await _transactionService.GetByIdAsync(id, cancellationToken);
        if (transaction is null) return NotFound();
        return Ok(transaction);
    }
}
