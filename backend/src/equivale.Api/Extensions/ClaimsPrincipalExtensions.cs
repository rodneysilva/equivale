using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace equivale.Api.Extensions;

/// <summary>
/// Resolução centralizada do ID do usuário autenticado a partir do JWT em cookie.
/// Fonte única de verdade — todos os controllers devem usar isto em vez de
/// copiar a lógica de leitura de claim (evita drift de autenticação).
/// </summary>
public static class ClaimsPrincipalExtensions
{
    public static string GetUserIdOrThrow(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new UnauthorizedAccessException("Token inválido.");
    }
}
