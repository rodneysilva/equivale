using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public AdminController(
        IUserRepository userRepository,
        IProductRepository productRepository,
        IServiceRepository serviceRepository,
        ICommunityRepository communityRepository,
        ITransactionRepository transactionRepository)
    {
        _userRepository = userRepository;
        _productRepository = productRepository;
        _serviceRepository = serviceRepository;
        _communityRepository = communityRepository;
        _transactionRepository = transactionRepository;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats(CancellationToken ct)
    {
        var users = await _userRepository.GetAllAsync(ct);
        var products = await _productRepository.GetAllAsync(ct);
        var services = await _serviceRepository.GetAllAsync(ct);
        var communities = await _communityRepository.GetAllAsync(ct);
        var transactions = await _transactionRepository.GetAllAsync(ct);

        return Ok(new AdminStatsDto(
            Users: users.Count,
            Products: products.Count,
            Services: services.Count,
            Communities: communities.Count,
            Transactions: transactions.Count,
            CompletedTransactions: transactions.Count(t => t.Status == Domain.Enums.TransactionStatus.Finished)
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
}

public record AdminStatsDto(
    int Users,
    int Products,
    int Services,
    int Communities,
    int Transactions,
    int CompletedTransactions);
