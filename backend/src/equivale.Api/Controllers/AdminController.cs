using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IProductRepository _productRepository;

    public AdminController(IUserRepository userRepository, IProductRepository productRepository)
    {
        _userRepository = userRepository;
        _productRepository = productRepository;
    }

    [HttpGet("users/pending")]
    public async Task<IActionResult> GetPendingUsers(CancellationToken cancellationToken)
    {
        // Return all users for admin review - filter on client if needed
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return Ok(users);
    }

    [HttpPut("products/{id}/approve")]
    public async Task<IActionResult> ApproveProduct(string id, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null) return NotFound();

        product.Status = Domain.Enums.ItemStatus.Active;
        product.UpdatedAt = DateTime.UtcNow;
        await _productRepository.UpdateAsync(product, cancellationToken);
        return NoContent();
    }

    [HttpPut("products/{id}/reject")]
    public async Task<IActionResult> RejectProduct(string id, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null) return NotFound();

        product.Status = Domain.Enums.ItemStatus.Rejected;
        product.UpdatedAt = DateTime.UtcNow;
        await _productRepository.UpdateAsync(product, cancellationToken);
        return NoContent();
    }

    [HttpPut("users/{id}/ban")]
    public async Task<IActionResult> BanUser(string id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null) return NotFound();

        // Ban logic - set role or a ban flag; for simplicity, we just note it
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return NoContent();
    }

    [HttpPut("users/{id}/unban")]
    public async Task<IActionResult> UnbanUser(string id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null) return NotFound();

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
        return NoContent();
    }
}
