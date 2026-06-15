using equivale.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly SeedService _seedService;
    private readonly IHostEnvironment _env;

    public SeedController(SeedService seedService, IHostEnvironment env)
    {
        _seedService = seedService;
        _env = env;
    }

    [HttpPost("run")]
    public async Task<IActionResult> Run(CancellationToken cancellationToken)
    {
        if (!_env.IsDevelopment())
            return Forbid("Seed disponível apenas em ambiente de Development.");

        var result = await _seedService.RunAsync(cancellationToken);
        return Ok(new
        {
            message = "Seed concluído com sucesso.",
            result.Users,
            result.Communities,
            result.Products,
            result.Services,
            seedPassword = "Eql@2026"
        });
    }
}
