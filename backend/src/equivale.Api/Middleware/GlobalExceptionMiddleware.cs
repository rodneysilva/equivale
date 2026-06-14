using System.Text.Json;
using equivale.Application.DTOs;

namespace equivale.Api.Middleware;

/// <summary>
/// Middleware global de tratamento de excecoes.
/// Captura excecoes nao tratadas e retorna respostas padronizadas.
/// </summary>
public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, errorResponse) = exception switch
        {
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, BuildError("Unauthorized", exception.Message)),
            ArgumentException => (StatusCodes.Status400BadRequest, BuildError("ValidationError", exception.Message)),
            InvalidOperationException => (StatusCodes.Status400BadRequest, BuildError("OperationError", exception.Message)),
            KeyNotFoundException => (StatusCodes.Status404NotFound, BuildError("NotFound", exception.Message)),
            _ => HandleUnknownException(exception)
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await context.Response.WriteAsync(json);
    }

    private (int StatusCode, ErrorResponseDto Response) HandleUnknownException(Exception exception)
    {
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
        return (StatusCodes.Status500InternalServerError, BuildError("InternalServerError", "An unexpected error occurred."));
    }

    private static ErrorResponseDto BuildError(string error, string message) => new(error, message);
}

/// <summary>
/// Extension method para registrar o middleware.
/// </summary>
public static class GlobalExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
