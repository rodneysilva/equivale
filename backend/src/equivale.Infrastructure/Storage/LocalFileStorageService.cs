using equivale.Application.Interfaces.Services;
using equivale.Application.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace equivale.Infrastructure.Storage;

/// <summary>
/// Implementacao de armazenamento local de arquivos.
/// Salva no filesystem com subdiretorio por data (YYYY/MM/DD).
/// </summary>
public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly FileStorageSettings _settings;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IOptions<FileStorageSettings> settings, ILogger<LocalFileStorageService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> SaveAsync(Stream file, string fileName, CancellationToken cancellationToken = default)
    {
        ValidateFile(file, fileName);

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var uniqueName = $"{Guid.NewGuid():N}{extension}";
        var dateFolder = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var relativePath = Path.Combine(dateFolder, uniqueName);
        var fullPath = Path.Combine(_settings.BasePath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var fileStream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(fileStream, cancellationToken);

        _logger.LogInformation("File saved: {FullPath}", fullPath);
        return $"{_settings.UrlPrefix}/{relativePath}";
    }

    public Task DeleteAsync(string relativePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_settings.BasePath, relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("File deleted: {FullPath}", fullPath);
        }
        return Task.CompletedTask;
    }

    private void ValidateFile(Stream file, string fileName)
    {
        if (file.Length > _settings.MaxFileSizeBytes)
            throw new ArgumentException(
                $"File exceeds maximum size of {_settings.MaxFileSizeBytes / 1024 / 1024}MB.");

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!_settings.AllowedExtensions.Contains(extension))
            throw new ArgumentException(
                $"File extension '{extension}' is not allowed. Allowed: {string.Join(", ", _settings.AllowedExtensions)}");
    }
}
