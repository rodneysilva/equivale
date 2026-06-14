using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IServiceRepository _serviceRepository;

    public ServicesController(IServiceService serviceService, IServiceRepository serviceRepository)
    {
        _serviceService = serviceService;
        _serviceRepository = serviceRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> GetAll(CancellationToken cancellationToken)
    {
        var services = await _serviceService.GetAllAsync(cancellationToken);
        return Ok(services);
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
}
