using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Api.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly JwtSettings _jwtSettings;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            var token = GenerateJwtToken(result);
            return Ok(result with { Token = token });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            var token = GenerateJwtToken(result);
            return Ok(result with { Token = token });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    private string GenerateJwtToken(AuthResponseDto user)
    {
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.UserId),
            new System.Security.Claims.Claim(JwtRegisteredClaimNames.Email, user.Email),
            new System.Security.Claims.Claim("name", user.Name),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
