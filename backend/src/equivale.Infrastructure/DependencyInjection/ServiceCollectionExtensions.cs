using equivale.Application.Interfaces.Services;
using equivale.Application.Models;
using equivale.Infrastructure.Persistence;
using equivale.Infrastructure.Repositories;
using equivale.Infrastructure.Security;
using equivale.Infrastructure.Storage;
using equivale.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace equivale.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMongoDb(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MongoDbSettings>(
            configuration.GetSection("MongoDb"));

        services.Configure<FileStorageSettings>(
            configuration.GetSection(FileStorageSettings.SectionName));

        services.AddSingleton<IMongoClient>(sp =>
        {
            var settings = configuration.GetSection("MongoDb").Get<MongoDbSettings>()!;
            return new MongoClient(settings.ConnectionString);
        });

        services.AddScoped<MongoDbContext>();

        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IUnitOfWork, MongoUnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<ICommunityRepository, CommunityRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<SearchRepository>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        return services;
    }
}
