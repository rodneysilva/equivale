using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Enums;

namespace equivale.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.User))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images ?? new List<string>()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ItemStatus.Active))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Service mappings
        CreateMap<Service, ServiceDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<CreateServiceDto, Service>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ItemStatus.Active))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Community mappings
        CreateMap<Community, CommunityDto>();
        CreateMap<CreateCommunityDto, Community>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => new List<string>()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Transaction mappings
        CreateMap<Transaction, TransactionDto>()
            .ForMember(dest => dest.TransactionType, opt => opt.MapFrom(src => src.TransactionType.ToString()));
        CreateMap<CreateTransactionDto, Transaction>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

        // Review mappings
        CreateMap<Review, ReviewDto>();
        CreateMap<CreateReviewDto, Review>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
    }
}
