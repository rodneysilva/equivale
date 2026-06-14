using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Domain.Interfaces;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IUserRepository _userRepository;

    public UsersController(IUserService userService, IUserRepository userRepository)
    {
        _userService = userService;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(string id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
    {
        var user = await _userService.UpdateAsync(id, dto, cancellationToken);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return NotFound();

        await _userRepository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
