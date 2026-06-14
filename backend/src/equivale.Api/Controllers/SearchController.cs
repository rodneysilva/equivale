using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Infrastructure.Repositories;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly SearchRepository _searchRepository;

    public SearchController(SearchRepository searchRepository)
    {
        _searchRepository = searchRepository;
    }

    /// <summary>
    /// Busca Products por texto (titulo, descricao, categoria).
    /// GET /api/search/products?q=termo&page=1&pageSize=20
    /// </summary>
    [HttpGet("products")]
    public async Task<ActionResult<PagedResult<ProductDto>>> SearchProducts(
        [FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Query parameter 'q' is required." });

        var pagination = new PaginationParams { Page = page, PageSize = pageSize };
        var result = await _searchRepository.SearchProductsAsync(q, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Busca Services por texto (titulo, descricao, categoria).
    /// GET /api/search/services?q=termo&page=1&pageSize=20
    /// </summary>
    [HttpGet("services")]
    public async Task<ActionResult<PagedResult<ServiceDto>>> SearchServices(
        [FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Query parameter 'q' is required." });

        var result = await _searchRepository.SearchServicesAsync(q, page, pageSize, cancellationToken);
        return Ok(result);
    }
}
