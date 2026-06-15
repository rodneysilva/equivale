using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Infrastructure.Repositories;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly SearchRepository _searchRepository;
    private readonly ICommunityRepository _communityRepository;

    public SearchController(SearchRepository searchRepository, ICommunityRepository communityRepository)
    {
        _searchRepository = searchRepository;
        _communityRepository = communityRepository;
    }

    [HttpGet("products")]
    public async Task<ActionResult<PagedResult<ProductDto>>> SearchProducts(
        [FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Query parameter 'q' is required." });

        var result = await _searchRepository.SearchProductsAsync(q, page, pageSize, cancellationToken);
        return Ok(result);
    }

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

    /// <summary>
    /// Busca unificada: produtos, serviços e comunidades.
    /// GET /api/search/all?q=termo&limit=5
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<UnifiedSearchResult>> SearchAll(
        [FromQuery] string q, [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new UnifiedSearchResult());

        var term = q.Trim();

        var productsTask = _searchRepository.SearchProductsAsync(term, 1, limit, cancellationToken);
        var servicesTask = _searchRepository.SearchServicesAsync(term, 1, limit, cancellationToken);
        var communitiesTask = _communityRepository.GetByNameAsync(term, cancellationToken);

        await Task.WhenAll(productsTask, servicesTask, communitiesTask);

        var products = productsTask.Result.Items;
        var services = servicesTask.Result.Items;
        var exactCommunity = communitiesTask.Result;

        var communities = new List<CommunitySearchItem>();
        if (exactCommunity is not null)
        {
            communities.Add(new CommunitySearchItem(
                exactCommunity.Id, exactCommunity.Name, exactCommunity.Description,
                exactCommunity.ImageUrl, exactCommunity.Members.Count));
        }

        return Ok(new UnifiedSearchResult(
            products.Select(p => new SearchItem(
                p.Id, p.Title, p.Description, p.Images.FirstOrDefault(), p.PriceInEquivale,
                "product", p.Category, p.SellerName)).ToList(),
            services.Select(s => new SearchItem(
                s.Id, s.Title, s.Description, null, s.PriceInEquivale,
                "service", s.Category, s.ProviderName)).ToList(),
            communities
        ));
    }
}

public record UnifiedSearchResult(
    List<SearchItem> Products = null!,
    List<SearchItem> Services = null!,
    List<CommunitySearchItem> Communities = null!)
{
    public UnifiedSearchResult() : this(new(), new(), new()) { }
}

public record SearchItem(
    string Id,
    string Title,
    string Description,
    string? ImageUrl,
    decimal Price,
    string Type,
    string Category,
    string? AuthorName);

public record CommunitySearchItem(
    string Id,
    string Name,
    string Description,
    string? ImageUrl,
    int MembersCount);
