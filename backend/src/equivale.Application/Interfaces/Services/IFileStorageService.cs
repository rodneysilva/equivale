namespace equivale.Application.Interfaces.Services;

/// <summary>
/// Servico de upload de arquivos.
/// Abstracao do dominio para persistencia de arquivos.
/// </summary>
public interface IFileStorageService
{
    /// <summary>Salva um arquivo e retorna a URL relativa.</summary>
    Task<string> SaveAsync(Stream file, string fileName, CancellationToken cancellationToken = default);

    /// <summary>Remove um arquivo pelo caminho relativo.</summary>
    Task DeleteAsync(string relativePath, CancellationToken cancellationToken = default);
}
