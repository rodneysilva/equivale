using System.IdentityModel.Tokens.Jwt;
using equivale.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IServiceRepository _serviceRepository;
    private readonly IMediator _mediator;
    private readonly IUserActivityService _activityService;

    public ServicesController(IServiceService serviceService, IServiceRepository serviceRepository, IMediator mediator, IUserActivityService activityService)
    {
        _serviceService = serviceService;
        _serviceRepository = serviceRepository;
        _mediator = mediator;
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ServiceDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null, [FromQuery] string? search = null, [FromQuery] List<string>? tags = null, [FromQuery] string? providerId = null, [FromQuery] string? communityId = null, [FromQuery] string? sortBy = "recent",
        CancellationToken cancellationToken = default)
    {
        var query = new Application.Queries.Services.GetAllServicesQuery(
            new PaginationParams { Page = page, PageSize = pageSize }, search, category, tags, providerId, communityId, sortBy);
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
        var userId = GetUserId();
        // O provedor é sempre o usuário autenticado — ignora ProviderId do body (anti-impersonação).
        var safeDto = dto with { ProviderId = userId };
        var service = await _serviceService.CreateAsync(safeDto, cancellationToken);
        _ = _activityService.LogAsync(userId, ActivityType.ServicePublished, "Service", service.Id, service.Title, "ofereceu um serviço", cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ServiceDto>> Update(string id, [FromBody] CreateServiceDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var existing = await _serviceService.GetByIdAsync(id, cancellationToken);
        if (existing is null) return NotFound();
        if (existing.ProviderId != userId && !User.IsInRole("Admin")) return Forbid();
        // Preserva o dono original — não permite reatribuir via body.
        var safeDto = dto with { ProviderId = existing.ProviderId };
        var service = await _serviceService.UpdateAsync(id, safeDto, cancellationToken);
        return Ok(service);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var existing = await _serviceService.GetByIdAsync(id, cancellationToken);
        if (existing is null) return NotFound();
        if (existing.ProviderId != userId && !User.IsInRole("Admin")) return Forbid();
        await _serviceService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("provider/{providerId}")]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> GetByProvider(string providerId, CancellationToken cancellationToken)
    {
        var services = await _serviceService.GetByProviderAsync(providerId, cancellationToken);
        return Ok(services);
    }

    private string GetUserId() => User.GetUserIdOrThrow();
}
