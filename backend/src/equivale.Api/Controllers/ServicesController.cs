using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IServiceRepository _serviceRepository;
    private readonly ITransactionService _transactionService;
    private readonly IMediator _mediator;

    public ServicesController(IServiceService serviceService, IServiceRepository serviceRepository, ITransactionService transactionService, IMediator mediator)
    {
        _serviceService = serviceService;
        _serviceRepository = serviceRepository;
        _transactionService = transactionService;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ServiceDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null, [FromQuery] string? search = null, [FromQuery] List<string>? tags = null, [FromQuery] string? providerId = null, [FromQuery] string? communityId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new Application.Queries.Services.GetAllServicesQuery(
            new PaginationParams { Page = page, PageSize = pageSize }, search, category, tags, providerId, communityId);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var service = await _serviceService.GetByIdAsync(id, cancellationToken);
        if (service is null) return NotFound();
        return Ok(service);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ServiceDto>> Create([FromBody] CreateServiceDto dto, CancellationToken cancellationToken)
    {
        var service = await _serviceService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ServiceDto>> Update(string id, [FromBody] CreateServiceDto dto, CancellationToken cancellationToken)
    {
        var service = await _serviceService.UpdateAsync(id, dto, cancellationToken);
        if (service is null) return NotFound();
        return Ok(service);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        await _serviceService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("provider/{providerId}")]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> GetByProvider(string providerId, CancellationToken cancellationToken)
    {
        var services = await _serviceService.GetByProviderAsync(providerId, cancellationToken);
        return Ok(services);
    }

    [HttpPost("{id}/hire")]
    [Authorize]
    public async Task<ActionResult<TransactionDto>> Hire(string id, CancellationToken cancellationToken)
    {
        var service = await _serviceService.GetByIdAsync(id, cancellationToken);
        if (service is null) return NotFound();

        var clientId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token");

        if (clientId == service.ProviderId)
            return BadRequest("Cannot hire your own service");

        var transaction = await _transactionService.CreateAsync(new CreateTransactionDto(
            FromUserId: clientId,
            ToUserId: service.ProviderId,
            Amount: service.PriceInEquivale,
            Description: $"Service hire: {service.Title}",
            TransactionType: "Purchase",
            RelatedItemId: id), cancellationToken);

        return Ok(transaction);
    }
}
