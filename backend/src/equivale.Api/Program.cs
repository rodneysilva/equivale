using System.Text;
using equivale.Api.Configuration;
using equivale.Application.Interfaces.Services;
using equivale.Application.Mappings;
using equivale.Application.Services;
using equivale.Infrastructure.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

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

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
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
});

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
