using System.Threading.RateLimiting;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using equivale.Api.BackgroundServices;
using equivale.Api.Configuration;
using equivale.Api.Middleware;
using equivale.Application.Interfaces.Services;
using equivale.Application.Mappings;
using equivale.Application.Models;
using equivale.Application.Services;
using equivale.Infrastructure.DependencyInjection;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Disable JWT claim type mapping so "sub" stays as "sub" (not mapped to .NET long names)
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// Serilog - Logging estruturado
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Equivale.Api")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(MappingProfile).Assembly);
builder.Services.AddFluentValidationAutoValidation();

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(MappingProfile).Assembly));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB
builder.Services.AddMongoDb(builder.Configuration);
builder.Services.AddRepositories();

// Application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<ICommunityService, CommunityService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<equivale.Application.Services.DtoEnricher>();
builder.Services.AddScoped<equivale.Application.Services.SeedService>();
builder.Services.AddScoped<equivale.Application.Services.TransactionService>();
builder.Services.AddScoped<equivale.Application.Services.IDemurrageService, equivale.Application.Services.DemurrageService>();
builder.Services.AddScoped<equivale.Domain.Interfaces.IUserActivityRepository, equivale.Infrastructure.Repositories.UserActivityRepository>();
builder.Services.AddScoped<equivale.Application.Interfaces.Services.IUserActivityService, equivale.Application.Services.UserActivityService>();
builder.Services.AddScoped<equivale.Domain.Interfaces.INotificationRepository, equivale.Infrastructure.Repositories.NotificationRepository>();

// Scheduler em background (demurrage mensal automático)
builder.Services.AddHostedService<DemurrageSchedulerHostedService>();

// Config options
builder.Services.Configure<equivale.Application.Configuration.TransactionFeeOptions>(builder.Configuration.GetSection(equivale.Application.Configuration.TransactionFeeOptions.SectionName));
builder.Services.Configure<equivale.Application.Configuration.DemurrageOptions>(builder.Configuration.GetSection(equivale.Application.Configuration.DemurrageOptions.SectionName));

// Domain repositories
builder.Services.AddScoped<equivale.Domain.Interfaces.ITransactionRepository, equivale.Infrastructure.Repositories.TransactionRepository>();
builder.Services.AddScoped(typeof(equivale.Domain.Interfaces.IBaseRepository<equivale.Domain.Entities.Review>), sp =>
{
    var ctx = sp.GetRequiredService<equivale.Infrastructure.Persistence.MongoDbContext>();
    return new equivale.Infrastructure.Repositories.BaseRepository<equivale.Domain.Entities.Review>(ctx);
});
builder.Services.AddScoped(typeof(equivale.Domain.Interfaces.IBaseRepository<equivale.Domain.Entities.JoinRequest>), sp =>
{
    var ctx = sp.GetRequiredService<equivale.Infrastructure.Persistence.MongoDbContext>();
    return new equivale.Infrastructure.Repositories.BaseRepository<equivale.Domain.Entities.JoinRequest>(ctx);
});
builder.Services.AddScoped(typeof(equivale.Domain.Interfaces.IBaseRepository<equivale.Domain.Entities.Post>), sp =>
{
    var ctx = sp.GetRequiredService<equivale.Infrastructure.Persistence.MongoDbContext>();
    return new equivale.Infrastructure.Repositories.BaseRepository<equivale.Domain.Entities.Post>(ctx);
});
builder.Services.AddScoped(typeof(equivale.Domain.Interfaces.IBaseRepository<equivale.Domain.Entities.DemurrageEntry>), sp =>
{
    var ctx = sp.GetRequiredService<equivale.Infrastructure.Persistence.MongoDbContext>();
    return new equivale.Infrastructure.Repositories.BaseRepository<equivale.Domain.Entities.DemurrageEntry>(ctx);
});
builder.Services.AddScoped<equivale.Domain.Interfaces.ICommentRepository, equivale.Infrastructure.Repositories.CommentRepository>();
builder.Services.AddScoped<equivale.Domain.Interfaces.IChatMessageRepository, equivale.Infrastructure.Repositories.ChatMessageRepository>();

// In-memory cache for DTO enrichment
builder.Services.AddMemoryCache();

// Health Checks - usa o IMongoClient ja registrado pelo Infrastructure
builder.Services.AddHealthChecks()
    .AddMongoDb(
        sp => sp.GetRequiredService<IMongoClient>(),
        name: "mongodb",
        tags: ["db", "ready"]);

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
if (string.IsNullOrWhiteSpace(jwtSettings.Secret))
{
    jwtSettings.Secret = "dev-only-secret-key-change-in-production!!";
}

var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    // Permite ler o token de um cookie HttpOnly (fallback quando não há header)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var authHeader = context.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                context.Token = authHeader["Bearer ".Length..].Trim();
            }
            else if (context.Request.Cookies.TryGetValue("eql_token", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
            {
                context.Token = cookieToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Rate Limiting - protecao contra abuso de upload (10 uploads/minuto por usuario)
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers["X-Forwarded-For"].ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10000,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 200
            }));

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter = retryAfter.TotalSeconds.ToString("F0");
        }
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Muitas requisicoes. Tente novamente em breve." },
            cancellationToken);
    };
});

// CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000", "http://localhost:3001"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseGlobalExceptionHandling();

// Health Checks endpoints
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseRateLimiter();

// Serve arquivos de upload estaticamente
var fileSettings = app.Configuration.GetSection(FileStorageSettings.SectionName).Get<FileStorageSettings>()!;
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), fileSettings.BasePath);
Directory.CreateDirectory(uploadsPath); // garante que o diretorio existe
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = fileSettings.UrlPrefix,
    ContentTypeProvider = new FileExtensionContentTypeProvider()
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Garante índices do MongoDB (idempotente) antes de iniciar.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<equivale.Infrastructure.Persistence.MongoDbContext>();
    await dbContext.EnsureIndexesAsync();
}

try
{
    Log.Information("Starting Equivale API v{Version}", typeof(Program).Assembly.GetName().Version?.ToString() ?? "1.0.0");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
