using equivale.Application.Models;
using FluentAssertions;

namespace equivale.UnitTests.Infrastructure;

public class FileStorageSettingsTests
{
    [Fact]
    public void SectionName_ShouldBeFileStorage()
    {
        FileStorageSettings.SectionName.Should().Be("FileStorage");
    }

    [Fact]
    public void DefaultBasePath_ShouldBeUploads()
    {
        var settings = new FileStorageSettings();
        settings.BasePath.Should().Be("uploads");
    }

    [Fact]
    public void DefaultMaxFileSize_ShouldBe5MB()
    {
        var settings = new FileStorageSettings();
        settings.MaxFileSizeBytes.Should().Be(5 * 1024 * 1024);
    }

    [Fact]
    public void DefaultAllowedExtensions_ShouldIncludeCommonImages()
    {
        var settings = new FileStorageSettings();
        settings.AllowedExtensions.Should().Contain(".jpg");
        settings.AllowedExtensions.Should().Contain(".png");
        settings.AllowedExtensions.Should().Contain(".webp");
    }

    [Fact]
    public void DefaultUrlPrefix_ShouldBeApiFiles()
    {
        var settings = new FileStorageSettings();
        settings.UrlPrefix.Should().Be("/api/files");
    }
}
