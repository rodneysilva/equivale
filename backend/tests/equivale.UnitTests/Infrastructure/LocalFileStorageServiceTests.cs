using System.Text;
using equivale.Application.Models;
using equivale.Infrastructure.Storage;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace equivale.UnitTests.Infrastructure;

public class LocalFileStorageServiceTests : IDisposable
{
    private readonly string _tempDir;
    private readonly LocalFileStorageService _sut;
    private readonly Mock<ILogger<LocalFileStorageService>> _loggerMock;

    public LocalFileStorageServiceTests()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), $"equivale-test-{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempDir);

        _loggerMock = new Mock<ILogger<LocalFileStorageService>>();

        var settings = Options.Create(new FileStorageSettings
        {
            BasePath = _tempDir,
            UrlPrefix = "/api/files",
            MaxFileSizeBytes = 1024, // 1KB para testes
            AllowedExtensions = [".jpg", ".png"]
        });

        _sut = new LocalFileStorageService(settings, _loggerMock.Object);
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDir))
            Directory.Delete(_tempDir, recursive: true);
    }

    [Fact]
    public async Task SaveAsync_ValidFile_ShouldReturnUrl()
    {
        // Arrange
        using var stream = new MemoryStream("test-content"u8.ToArray());
        const string fileName = "photo.jpg";

        // Act
        var url = await _sut.SaveAsync(stream, fileName);

        // Assert
        url.Should().StartWith("/api/files/");
        url.Should().EndWith(".jpg");
        url.Should().NotContain("photo"); // deve ter GUID, nao nome original

        // Arquivo deve existir no disco
        var relativePath = url.Replace("/api/files/", "");
        var fullPath = Path.Combine(_tempDir, relativePath);
        File.Exists(fullPath).Should().BeTrue();
    }

    [Fact]
    public async Task SaveAsync_LargeFile_ShouldThrowArgumentException()
    {
        // Arrange - cria stream > 1KB
        var content = new byte[2048];
        using var stream = new MemoryStream(content);
        const string fileName = "large.jpg";

        // Act
        var act = () => _sut.SaveAsync(stream, fileName);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*exceeds maximum size*");
    }

    [Fact]
    public async Task SaveAsync_InvalidExtension_ShouldThrowArgumentException()
    {
        // Arrange
        using var stream = new MemoryStream("tiny"u8.ToArray());
        const string fileName = "document.pdf";

        // Act
        var act = () => _sut.SaveAsync(stream, fileName);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not allowed*");
    }

    [Fact]
    public async Task DeleteAsync_ExistingFile_ShouldRemoveIt()
    {
        // Arrange - salva um arquivo primeiro
        using var stream = new MemoryStream("to-delete"u8.ToArray());
        var url = await _sut.SaveAsync(stream, "delete-me.png");
        var relativePath = url.Replace("/api/files/", "");
        var fullPath = Path.Combine(_tempDir, relativePath);
        File.Exists(fullPath).Should().BeTrue();

        // Act
        await _sut.DeleteAsync(relativePath);

        // Assert
        File.Exists(fullPath).Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_NonExistentFile_ShouldNotThrow()
    {
        // Act & Assert - nao deve lancar excecao
        var act = () => _sut.DeleteAsync("nonexistent/image.jpg");
        await act.Should().NotThrowAsync();
    }
}
