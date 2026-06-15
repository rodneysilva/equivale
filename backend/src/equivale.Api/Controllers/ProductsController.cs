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
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IProductRepository _productRepository;
    private readonly ITransactionService _transactionService;
    private readonly IMediator _mediator;

    public ProductsController(IProductService productService, IProductRepository productRepository, ITransactionService transactionService, IMediator mediator)
    {
        _productService = productService;
        _productRepository = productRepository;
        _transactionService = transactionService;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null, [FromQuery] string? search = null, [FromQuery] string? tag = null,
        CancellationToken cancellationToken = default)
    {
        var query = new Application.Queries.Products.GetAllProductsQuery(
            new PaginationParams { Page = page, PageSize = pageSize }, search, category, tag);
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
        var product = await _productService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ProductDto>> Update(string id, [FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var product = await _productService.UpdateAsync(id, dto, cancellationToken);
        if (product is null) return NotFound();
        return Ok(product);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
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

    [HttpPost("{id}/buy")]
    [Authorize]
    public async Task<ActionResult<TransactionDto>> Buy(string id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product is null) return NotFound();

        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token");

        if (buyerId == product.SellerId)
            return BadRequest("Cannot buy your own product");

        var transaction = await _transactionService.CreateAsync(new CreateTransactionDto(
            FromUserId: buyerId,
            ToUserId: product.SellerId,
            Amount: product.PriceInEquivale,
            Description: $"Purchase: {product.Title}",
            TransactionType: "Purchase",
            RelatedItemId: id), cancellationToken);

        return Ok(transaction);
    }
}
