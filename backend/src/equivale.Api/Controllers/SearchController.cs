using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Infrastructure.Repositories;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly SearchRepository _searchRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;
    private readonly IProductRepository _productRepository;
    private readonly IServiceRepository _serviceRepository;

    public SearchController(SearchRepository searchRepository, ICommunityRepository communityRepository,
        IUserRepository userRepository, IProductRepository productRepository, IServiceRepository serviceRepository)
    {
        _searchRepository = searchRepository;
        _communityRepository = communityRepository;
        _userRepository = userRepository;
        _productRepository = productRepository;
        _serviceRepository = serviceRepository;
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

    [HttpGet("all")]
    public async Task<ActionResult<UnifiedSearchResult>> SearchAll(
        [FromQuery] string q, [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new UnifiedSearchResult());

        var term = q.Trim();
        var productsTask = _searchRepository.SearchProductsRegexAsync(term, limit, cancellationToken);
        var servicesTask = _searchRepository.SearchServicesRegexAsync(term, limit, cancellationToken);
        var communitiesTask = _communityRepository.GetAllAsync(cancellationToken);

        await Task.WhenAll(productsTask, servicesTask, communitiesTask);

        var products = productsTask.Result;
        var services = servicesTask.Result;
        var allCommunities = communitiesTask.Result;

        var communities = allCommunities
            .Where(c => c.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                        c.Description.Contains(term, StringComparison.OrdinalIgnoreCase))
            .Take(limit)
            .Select(c => new CommunitySearchItem(c.Id, c.Name, c.Description, c.ImageUrl, c.Members.Count))
            .ToList();

        return Ok(new UnifiedSearchResult(
            products.Select(p => new SearchItem(p.Id, p.Title, p.Description, p.Images.FirstOrDefault(), (decimal)p.PriceInEquivale, "product", p.Category, null)).ToList(),
            services.Select(s => new SearchItem(s.Id, s.Title, s.Description, null, (decimal)s.PriceInEquivale, "service", s.Category, null)).ToList(),
            communities
        ));
    }

    [HttpGet("product-facets")]
    public async Task<ActionResult<FacetResult>> GetProductFacets(
        [FromQuery] string? category = null, [FromQuery] List<string>? tags = null,
        CancellationToken cancellationToken = default)
    {
        var cats = await _searchRepository.GetProductCategoryCountsAsync(null, tags, cancellationToken);
        var tgs = await _searchRepository.GetProductTagCountsAsync(category, tags, cancellationToken);
        return Ok(new FacetResult(cats, tgs));
    }

    [HttpGet("service-facets")]
    public async Task<ActionResult<FacetResult>> GetServiceFacets(
        [FromQuery] string? category = null, [FromQuery] List<string>? tags = null,
        CancellationToken cancellationToken = default)
    {
        var cats = await _searchRepository.GetServiceCategoryCountsAsync(null, tags, cancellationToken);
        var tgs = await _searchRepository.GetServiceTagCountsAsync(category, tags, cancellationToken);
        return Ok(new FacetResult(cats, tgs));
    }

    /// <summary>
    /// Estatísticas públicas de um usuário (sem saldo).
    /// GET /api/search/user-stats/:userId
    /// </summary>
    [HttpGet("user-stats/{userId}")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats(string userId, CancellationToken cancellationToken = default)
    {
        var productsTask = _productRepository.GetPagedFilteredAsync(1, 1, sellerId: userId, cancellationToken: cancellationToken);
        var servicesTask = _serviceRepository.GetPagedFilteredAsync(1, 1, providerId: userId, cancellationToken: cancellationToken);
        var communitiesTask = _communityRepository.GetAllAsync(cancellationToken);

        await Task.WhenAll(productsTask, servicesTask, communitiesTask);

        var productCount = productsTask.Result.Total;
        var serviceCount = servicesTask.Result.Total;
        var communityCount = communitiesTask.Result.Count(c => c.Members.Contains(userId) || c.CreatorId == userId);

        return Ok(new UserStatsDto(productCount, serviceCount, communityCount));
    }
}

public record UnifiedSearchResult(List<SearchItem> Products, List<SearchItem> Services, List<CommunitySearchItem> Communities)
{
    public UnifiedSearchResult() : this(new(), new(), new()) { }
}

public record SearchItem(string Id, string Title, string Description, string? ImageUrl, decimal Price, string Type, string Category, string? AuthorName);
public record CommunitySearchItem(string Id, string Name, string Description, string? ImageUrl, int MembersCount);
public record FacetResult(Dictionary<string, int> Categories, Dictionary<string, int> Tags);
public record UserStatsDto(int Products, int Services, int Communities);
