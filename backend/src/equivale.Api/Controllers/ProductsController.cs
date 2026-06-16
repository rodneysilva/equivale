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
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IProductRepository _productRepository;
    private readonly IMediator _mediator;
    private readonly IUserActivityService _activityService;

    public ProductsController(IProductService productService, IProductRepository productRepository, IMediator mediator, IUserActivityService activityService)
    {
        _productService = productService;
        _productRepository = productRepository;
        _mediator = mediator;
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null, [FromQuery] string? search = null, [FromQuery] List<string>? tags = null, [FromQuery] string? sellerId = null, [FromQuery] string? communityId = null, [FromQuery] string? sortBy = "recent",
        CancellationToken cancellationToken = default)
    {
        var query = new Application.Queries.Products.GetAllProductsQuery(
            new PaginationParams { Page = page, PageSize = pageSize }, search, category, tags, sellerId, communityId, sortBy);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product is null) return NotFound();
        return Ok(product);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        // O vendedor é sempre o usuário autenticado — ignora SellerId do body (anti-impersonação).
        var safeDto = dto with { SellerId = userId };
        var product = await _productService.CreateAsync(safeDto, cancellationToken);
        _ = _activityService.LogAsync(userId, ActivityType.ProductPublished, "Product", product.Id, product.Title, "publicou um produto", cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ProductDto>> Update(string id, [FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var existing = await _productService.GetByIdAsync(id, cancellationToken);
        if (existing is null) return NotFound();
        if (existing.SellerId != userId && !User.IsInRole("Admin")) return Forbid();
        // Preserva o dono original — não permite reatribuir via body.
        var safeDto = dto with { SellerId = existing.SellerId };
        var product = await _productService.UpdateAsync(id, safeDto, cancellationToken);
        return Ok(product);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var existing = await _productService.GetByIdAsync(id, cancellationToken);
        if (existing is null) return NotFound();
        if (existing.SellerId != userId && !User.IsInRole("Admin")) return Forbid();
        await _productService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("seller/{sellerId}")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetBySeller(string sellerId, CancellationToken cancellationToken)
    {
        var products = await _productService.GetBySellerAsync(sellerId, cancellationToken);
        return Ok(products);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetByCategory(string category, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetByCategoryAsync(category, cancellationToken);
        return Ok(products);
    }

    private string GetUserId() => User.GetUserIdOrThrow();
}
