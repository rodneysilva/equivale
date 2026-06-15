using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace equivale.Application.Services;

public class DtoEnricher
{
    private readonly IUserRepository _userRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IMemoryCache _cache;

    public DtoEnricher(IUserRepository userRepository, ICommunityRepository communityRepository, IMemoryCache cache)
    {
        _userRepository = userRepository;
        _communityRepository = communityRepository;
        _cache = cache;
    }

    public async Task EnrichProductsAsync(IList<ProductDto> products, CancellationToken cancellationToken)
    {
        if (products.Count == 0) return;

        var userIds = products.Select(p => p.SellerId).Distinct();
        var communityIds = products.Select(p => p.CommunityId).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().Select(c => c!);

        var users = await FetchUsersAsync(userIds, cancellationToken);
        var communities = await FetchCommunitiesAsync(communityIds, cancellationToken);

        for (var i = 0; i < products.Count; i++)
        {
            var product = products[i];
            string? sellerName = null, sellerAvatar = null, communityName = null;

            if (users.TryGetValue(product.SellerId, out var user))
            {
                sellerName = user.Name;
                sellerAvatar = user.AvatarUrl;
            }
            if (!string.IsNullOrWhiteSpace(product.CommunityId) && communities.TryGetValue(product.CommunityId!, out var community))
            {
                communityName = community.Name;
            }

            products[i] = product with { SellerName = sellerName, SellerAvatarUrl = sellerAvatar, CommunityName = communityName };
        }
    }

    public async Task EnrichServicesAsync(IList<ServiceDto> services, CancellationToken cancellationToken)
    {
        if (services.Count == 0) return;

        var userIds = services.Select(p => p.ProviderId).Distinct();
        var communityIds = services.Select(p => p.CommunityId).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().Select(c => c!);

        var users = await FetchUsersAsync(userIds, cancellationToken);
        var communities = await FetchCommunitiesAsync(communityIds, cancellationToken);

        for (var i = 0; i < services.Count; i++)
        {
            var service = services[i];
            string? providerName = null, providerAvatar = null, communityName = null;

            if (users.TryGetValue(service.ProviderId, out var user))
            {
                providerName = user.Name;
                providerAvatar = user.AvatarUrl;
            }
            if (!string.IsNullOrWhiteSpace(service.CommunityId) && communities.TryGetValue(service.CommunityId!, out var community))
            {
                communityName = community.Name;
            }

            services[i] = service with { ProviderName = providerName, ProviderAvatarUrl = providerAvatar, CommunityName = communityName };
        }
    }

    private async Task<Dictionary<string, User>> FetchUsersAsync(IEnumerable<string> ids, CancellationToken cancellationToken)
    {
        var idList = ids.Distinct().ToList();
        var result = new Dictionary<string, User>();
        var missing = new List<string>();

        foreach (var id in idList)
        {
            if (_cache.TryGetValue($"user:{id}", out User? cached) && cached is not null)
                result[id] = cached;
            else
                missing.Add(id);
        }

        if (missing.Count > 0)
        {
            var fetched = await _userRepository.GetByIdsAsync(missing, cancellationToken);
            foreach (var user in fetched)
            {
                result[user.Id] = user;
                _cache.Set($"user:{user.Id}", user, TimeSpan.FromMinutes(5));
            }
        }

        return result;
    }

    private async Task<Dictionary<string, Community>> FetchCommunitiesAsync(IEnumerable<string> ids, CancellationToken cancellationToken)
    {
        var idList = ids.Distinct().ToList();
        var result = new Dictionary<string, Community>();
        var missing = new List<string>();

        foreach (var id in idList)
        {
            if (_cache.TryGetValue($"community:{id}", out Community? cached) && cached is not null)
                result[id] = cached;
            else
                missing.Add(id);
        }

        if (missing.Count > 0)
        {
            var fetched = await _communityRepository.GetByIdsAsync(missing, cancellationToken);
            foreach (var community in fetched)
            {
                result[community.Id] = community;
                _cache.Set($"community:{community.Id}", community, TimeSpan.FromMinutes(5));
            }
        }

        return result;
    }
}
