using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace equivale.Application.Services;

/// <summary>
/// Fallback enricher para ProductDto/ServiceDto. Agora as entidades Product e Service já embutem
/// SellerName/SellerAvatarUrl/CommunityName (ou ProviderName equivalentes), que são mapeados
/// diretamente pelo AutoMapper. Este enricher serve como defesa para documentos legados (criados
/// antes da versão que embute os nomes) que possam ter esses campos nulos.
/// </summary>
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

        var needsEnrichment = products.Where(p => p.SellerName is null || p.CommunityName is null).ToList();
        if (needsEnrichment.Count == 0) return;

        var userIds = needsEnrichment.Select(p => p.SellerId).Distinct();
        var communityIds = needsEnrichment.Select(p => p.CommunityId).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().Select(c => c!);

        var users = await FetchUsersAsync(userIds, cancellationToken);
        var communities = await FetchCommunitiesAsync(communityIds, cancellationToken);

        for (var i = 0; i < products.Count; i++)
        {
            var product = products[i];
            if (product.SellerName is not null) continue;

            string? sellerName = null, sellerAvatar = null, communityName = product.CommunityName;

            if (users.TryGetValue(product.SellerId, out var user))
            {
                sellerName = user.Name;
                sellerAvatar = user.AvatarUrl;
            }
            if (!string.IsNullOrWhiteSpace(product.CommunityId) && communityName is null && communities.TryGetValue(product.CommunityId!, out var community))
            {
                communityName = community.Name;
            }

            products[i] = product with { SellerName = sellerName, SellerAvatarUrl = sellerAvatar, CommunityName = communityName };
        }
    }

    public async Task EnrichServicesAsync(IList<ServiceDto> services, CancellationToken cancellationToken)
    {
        if (services.Count == 0) return;

        var needsEnrichment = services.Where(s => s.ProviderName is null || s.CommunityName is null).ToList();
        if (needsEnrichment.Count == 0) return;

        var userIds = needsEnrichment.Select(p => p.ProviderId).Distinct();
        var communityIds = needsEnrichment.Select(p => p.CommunityId).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().Select(c => c!);

        var users = await FetchUsersAsync(userIds, cancellationToken);
        var communities = await FetchCommunitiesAsync(communityIds, cancellationToken);

        for (var i = 0; i < services.Count; i++)
        {
            var service = services[i];
            if (service.ProviderName is not null) continue;

            string? providerName = null, providerAvatar = null, communityName = service.CommunityName;

            if (users.TryGetValue(service.ProviderId, out var user))
            {
                providerName = user.Name;
                providerAvatar = user.AvatarUrl;
            }
            if (!string.IsNullOrWhiteSpace(service.CommunityId) && communityName is null && communities.TryGetValue(service.CommunityId!, out var community))
            {
                communityName = community.Name;
            }

            services[i] = service with { ProviderName = providerName, ProviderAvatarUrl = providerAvatar, CommunityName = communityName };
        }
    }

    public async Task EnrichCommunitiesAsync(IList<CommunityDto> communities, CancellationToken cancellationToken)
    {
        if (communities.Count == 0) return;

        var needsCreator = communities
            .Where(c => string.IsNullOrWhiteSpace(c.CreatorName) && !string.IsNullOrWhiteSpace(c.CreatorId))
            .ToList();

        var needsModeratorNames = communities
            .Where(c => (c.ModeratorNames is null || c.ModeratorNames.Count == 0) && c.Moderators.Count > 0)
            .ToList();

        if (needsCreator.Count == 0 && needsModeratorNames.Count == 0) return;

        var userIds = new List<string>();
        userIds.AddRange(needsCreator.Select(c => c.CreatorId!));
        userIds.AddRange(needsModeratorNames.SelectMany(c => c.Moderators));

        var users = await FetchUsersAsync(userIds, cancellationToken);

        for (var i = 0; i < communities.Count; i++)
        {
            var community = communities[i];

            string? creatorName = community.CreatorName;
            if (string.IsNullOrWhiteSpace(creatorName) &&
                !string.IsNullOrWhiteSpace(community.CreatorId) &&
                users.TryGetValue(community.CreatorId, out var creator))
            {
                creatorName = creator.Name;
            }

            List<string>? moderatorNames = community.ModeratorNames;
            if ((moderatorNames is null || moderatorNames.Count == 0) && community.Moderators.Count > 0)
            {
                moderatorNames = community.Moderators
                    .Where(id => users.ContainsKey(id))
                    .Select(id => users[id].Name)
                    .Where(n => !string.IsNullOrWhiteSpace(n))
                    .ToList();
            }

            if (creatorName != community.CreatorName || moderatorNames != community.ModeratorNames)
            {
                communities[i] = community with { CreatorName = creatorName, ModeratorNames = moderatorNames };
            }
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
