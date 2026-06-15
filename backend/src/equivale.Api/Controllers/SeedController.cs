using equivale.Application.Services;
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

    /// <summary>
    /// Popula o banco com dados de teste.
    /// POST /api/seed/run?users=20&communities=10&products=100&services=50
    /// </summary>
    [HttpPost("run")]
    public async Task<IActionResult> Run(
        [FromQuery] int users = 14,
        [FromQuery] int communities = 8,
        [FromQuery] int products = 50,
        [FromQuery] int services = 30,
        CancellationToken cancellationToken = default)
    {
        if (!_env.IsDevelopment())
            return Forbid("Seed disponível apenas em Development.");

        var opts = new SeedOptions
        {
            Users = users,
            Communities = communities,
            Products = products,
            Services = services,
        };

        var result = await _seedService.RunAsync(opts, cancellationToken);
        return Ok(new
        {
            message = "Seed concluído com sucesso.",
            result.Users,
            result.Communities,
            result.Products,
            result.Services,
            result.Transactions,
            seedPassword = "Eql@2026"
        });
    }
}
