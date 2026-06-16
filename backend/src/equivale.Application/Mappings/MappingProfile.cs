using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;

namespace equivale.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Value Object conversions (VO -> primitive)
        CreateMap<Email, string>().ConstructUsing(src => src.Address);
        CreateMap<Money, decimal>().ConstructUsing(src => src.Amount);

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email.Address))
            .ForMember(dest => dest.WalletBalance, opt => opt.MapFrom(src => src.WalletBalance.Amount))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => new Email(src.Email)))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.User))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForCtorParam("PriceInEquivale", opt => opt.MapFrom(src => src.PriceInEquivale.Amount))
            .ForCtorParam("ShippingCost", opt => opt.MapFrom(src => src.ShippingCost))
            .ForCtorParam("Stock", opt => opt.MapFrom(src => src.Stock))
            .ForCtorParam("Status", opt => opt.MapFrom(src => src.Status.ToString()))
            .ForCtorParam("Condition", opt => opt.MapFrom(src => src.Condition.ToString()))
            .ForCtorParam("SellerName", opt => opt.MapFrom(src => src.SellerName))
            .ForCtorParam("SellerAvatarUrl", opt => opt.MapFrom(src => src.SellerAvatarUrl))
            .ForCtorParam("CommunityName", opt => opt.MapFrom(src => src.CommunityName))
            .ForCtorParam("Tags", opt => opt.MapFrom(src => src.Tags));
        CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.PriceInEquivale, opt => opt.MapFrom(src => new Money(src.PriceInEquivale)))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images ?? new List<string>()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ItemStatus.Active))
            .ForMember(dest => dest.Condition, opt => opt.MapFrom(src => ParseCondition(src.Condition)))
            .ForMember(dest => dest.CommunityId, opt => opt.MapFrom(src => src.CommunityId))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags ?? new List<string>()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Service mappings
        CreateMap<Service, ServiceDto>()
            .ForCtorParam("PriceInEquivale", opt => opt.MapFrom(src => src.PriceInEquivale.Amount))
            .ForCtorParam("Status", opt => opt.MapFrom(src => src.Status.ToString()))
            .ForCtorParam("ProviderName", opt => opt.MapFrom(src => src.ProviderName))
            .ForCtorParam("ProviderAvatarUrl", opt => opt.MapFrom(src => src.ProviderAvatarUrl))
            .ForCtorParam("CommunityName", opt => opt.MapFrom(src => src.CommunityName))
            .ForCtorParam("Tags", opt => opt.MapFrom(src => src.Tags));
        CreateMap<CreateServiceDto, Service>()
            .ForMember(dest => dest.PriceInEquivale, opt => opt.MapFrom(src => new Money(src.PriceInEquivale)))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ItemStatus.Active))
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images ?? new List<string>()))
            .ForMember(dest => dest.CommunityId, opt => opt.MapFrom(src => src.CommunityId))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags ?? new List<string>()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Community mappings
        CreateMap<Community, CommunityDto>()
            .ForMember(dest => dest.MembersCount, opt => opt.MapFrom(src => src.Members.Count))
            .ForCtorParam("CreatorName", opt => opt.MapFrom(src => src.CreatorName))
            .ForCtorParam("ModeratorNames", opt => opt.MapFrom(src => src.ModeratorNames));
        CreateMap<CreateCommunityDto, Community>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => new List<string>()))
            .ForMember(dest => dest.Moderators, opt => opt.MapFrom(src => new List<string>()))
            .ForMember(dest => dest.InviteCode, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
        // UpdateCommunityDto is mapped manually in the command handler

        // Review mappings
        CreateMap<Review, ReviewDto>();
        CreateMap<CreateReviewDto, Review>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Transaction mappings
        CreateMap<Transaction, TransactionDto>()
            .ForCtorParam("BuyerName", opt => opt.MapFrom(_ => (string?)null))
            .ForCtorParam("SellerName", opt => opt.MapFrom(_ => (string?)null))
            .ForCtorParam("ItemType", opt => opt.MapFrom(src => src.ItemType.ToString()))
            .ForCtorParam("Status", opt => opt.MapFrom(src => src.Status.ToString()))
            .ForCtorParam("UnitPrice", opt => opt.MapFrom(src => src.UnitPrice.Amount))
            .ForCtorParam("ShippingCost", opt => opt.MapFrom(src => src.ShippingCost))
            .ForCtorParam("TotalPrice", opt => opt.MapFrom(src => src.TotalPrice.Amount))
            .ForCtorParam("FeeAmount", opt => opt.MapFrom(src => src.FeeAmount))
            .ForCtorParam("TrackingInfo", opt => opt.MapFrom(src => src.TrackingInfo))
            .ForCtorParam("DeliveryAddress", opt => opt.MapFrom(src => src.DeliveryAddress));
    }

    private static ProductCondition ParseCondition(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return ProductCondition.New;
        return value.Trim().ToLowerInvariant() switch
        {
            "used" or "usado" => ProductCondition.Used,
            "refurbished" or "recondicionado" => ProductCondition.Refurbished,
            _ => ProductCondition.New
        };
    }
}
