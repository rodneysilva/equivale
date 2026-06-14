using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.Interfaces.Services;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;

    public FilesController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Faz upload de uma imagem e retorna a URL.
    /// POST /api/files/upload
    /// </summary>
    [HttpPost("upload")]
    [Authorize]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
    public async Task<ActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        await using var stream = file.OpenReadStream();
        var url = await _fileStorageService.SaveAsync(stream, file.FileName, cancellationToken);

        return Ok(new { url });
    }
}
