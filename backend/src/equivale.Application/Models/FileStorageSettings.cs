namespace equivale.Application.Models;

/// <summary>
/// Configuracoes de upload de arquivos.
/// </summary>
public sealed class FileStorageSettings
{
    public const string SectionName = "FileStorage";

    /// <summary>Diretorio base para salvar arquivos (ex: /app/uploads).</summary>
    public string BasePath { get; set; } = "uploads";

    /// <summary>URL base para servir arquivos (ex: /api/files).</summary>
    public string UrlPrefix { get; set; } = "/api/files";

    /// <summary>Tamanho maximo em bytes (default 5MB).</summary>
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;

    /// <summary>Extensões permitidas (default: imagens).</summary>
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
}
