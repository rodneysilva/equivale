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
            .ForMember(dest => dest.PriceInEquivale, opt => opt.MapFrom(src => src.PriceInEquivale.Amount))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.PriceInEquivale, opt => opt.MapFrom(src => new Money(src.PriceInEquivale)))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images ?? new List<string>()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ItemStatus.Active))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Service mappings
        CreateMap<Service, ServiceDto>()
            .ForMember(dest => dest.PriceInEquivale, opt => opt.MapFrom(src => src.PriceInEquivale.Amount))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<CreateServiceDto, Service>()
            .ForMember(dest => dest.PriceInEquivale, opt => opt.MapFrom(src => new Money(src.PriceInEquivale)))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ItemStatus.Active))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Community mappings
        CreateMap<Community, CommunityDto>()
            .ForMember(dest => dest.MembersCount, opt => opt.MapFrom(src => src.Members.Count));
        CreateMap<CreateCommunityDto, Community>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => new List<string>()))
            .ForMember(dest => dest.Moderators, opt => opt.MapFrom(src => new List<string>()))
            .ForMember(dest => dest.InviteCode, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
        // UpdateCommunityDto is mapped manually in the command handler

        // Transaction mappings
        CreateMap<Transaction, TransactionDto>()
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount.Amount))
            .ForMember(dest => dest.TransactionType, opt => opt.MapFrom(src => src.TransactionType.ToString()));
        CreateMap<CreateTransactionDto, Transaction>()
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => new Money(src.Amount)))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Review mappings
        CreateMap<Review, ReviewDto>();
        CreateMap<CreateReviewDto, Review>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
    }
}
