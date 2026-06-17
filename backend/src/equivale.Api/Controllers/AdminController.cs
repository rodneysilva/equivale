using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.Services;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IProductRepository _productRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IDemurrageService _demurrageService;
    public AdminController(
        IUserRepository userRepository,
        IProductRepository productRepository,
        IServiceRepository serviceRepository,
        ICommunityRepository communityRepository,
        ITransactionRepository transactionRepository,
        IDemurrageService demurrageService)
    {
        _userRepository = userRepository;
        _productRepository = productRepository;
        _serviceRepository = serviceRepository;
        _communityRepository = communityRepository;
        _transactionRepository = transactionRepository;
        _demurrageService = demurrageService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats(CancellationToken ct)
    {
        var usersTask = _userRepository.CountAsync(ct);
        var productsTask = _productRepository.CountAsync(ct);
        var servicesTask = _serviceRepository.CountAsync(ct);
        var communitiesTask = _communityRepository.CountAsync(ct);
        var transactionsTask = _transactionRepository.CountAsync(ct);
        var finishedStatsTask = _transactionRepository.GetFinishedStatsAsync(ct);

        await Task.WhenAll(usersTask, productsTask, servicesTask, communitiesTask, transactionsTask, finishedStatsTask);

        var finished = finishedStatsTask.Result;

        return Ok(new AdminStatsDto(
            Users: usersTask.Result,
            Products: productsTask.Result,
            Services: servicesTask.Result,
            Communities: communitiesTask.Result,
            Transactions: transactionsTask.Result,
            CompletedTransactions: finished.CompletedTransactions,
            TotalFeesCollected: finished.TotalFeesCollected,
            TotalVolume: finished.TotalVolume
        ));
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(string id, [FromQuery] string role, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(id, ct);
        if (user is null) return NotFound();

        if (Enum.TryParse<UserRole>(role, true, out var newRole))
        {
            user.Role = newRole;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user, ct);
            return Ok(new { message = $"User role updated to {newRole}" });
        }
        return BadRequest(new { error = "Invalid role" });
    }

    [HttpPut("users/{id}/ban")]
    public async Task<IActionResult> BanUser(string id, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(id, ct);
        if (user is null) return NotFound();
        user.Role = UserRole.Banned;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, ct);
        return NoContent();
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(string id, CancellationToken ct)
    {
        await _productRepository.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(string id, CancellationToken ct)
    {
        await _serviceRepository.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpDelete("communities/{id}")]
    public async Task<IActionResult> DeleteCommunity(string id, CancellationToken ct)
    {
        await _communityRepository.DeleteAsync(id, ct);
        return NoContent();
    }

    // -------------------- Demurrage --------------------

    /// <summary>Dry-run: lista quem seria taxado e quanto, sem debitar nada.</summary>
    [HttpGet("demurrage/preview")]
    public async Task<ActionResult<equivale.Application.Services.DemurragePreviewResult>> DemurragePreview(CancellationToken ct)
        => Ok(await _demurrageService.PreviewAsync(ct));

    /// <summary>
    /// EXECUTA o demurrage: debita 0,5% do saldo disponível ocioso dos usuários
    /// elegíveis (queima o valor). Operação DESTRUTIVA — chamar uma vez por mês.
    /// </summary>
    [HttpPost("demurrage/run")]
    public async Task<ActionResult<equivale.Application.Services.DemurrageApplyResult>> DemurrageRun(CancellationToken ct)
        => Ok(await _demurrageService.ApplyAsync(ct));
}

public record AdminStatsDto(
    long Users,
    long Products,
    long Services,
    long Communities,
    long Transactions,
    long CompletedTransactions,
    decimal TotalFeesCollected,
    decimal TotalVolume);
