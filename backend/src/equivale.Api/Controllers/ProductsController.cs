using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IProductRepository _productRepository;

    public ProductsController(IProductService productService, IProductRepository productRepository)
    {
        _productService = productService;
        _productRepository = productRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAll(CancellationToken cancellationToken)
    {
        var products = await _productService.GetAllAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product is null) return NotFound();
        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> Update(string id, [FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var product = await _productService.UpdateAsync(id, dto, cancellationToken);
        if (product is null) return NotFound();
        return Ok(product);
    }

    [HttpDelete("{id}")]
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
}
