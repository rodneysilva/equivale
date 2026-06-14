using equivale.Application.DTOs;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class PaginationParamsTests
{
    [Fact]
    public void Page_DefaultValue_ShouldBeOne()
    {
        var params_ = new PaginationParams();
        params_.Page.Should().Be(1);
    }

    [Fact]
    public void PageSize_DefaultValue_ShouldBeTwenty()
    {
        var params_ = new PaginationParams();
        params_.PageSize.Should().Be(PaginationParams.DefaultPageSize);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(-1, 1)]
    [InlineData(-100, 1)]
    [InlineData(1, 1)]
    [InlineData(5, 5)]
    public void Page_ShouldClampToMinimumOne(int input, int expected)
    {
        var params_ = new PaginationParams { Page = input };
        params_.Page.Should().Be(expected);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(-5, 1)]
    [InlineData(1, 1)]
    [InlineData(20, 20)]
    [InlineData(50, 50)]
    [InlineData(100, 100)]
    [InlineData(200, 100)]
    public void PageSize_ShouldClampBetweenOneAndMax(int input, int expected)
    {
        var params_ = new PaginationParams { PageSize = input };
        params_.PageSize.Should().Be(expected);
    }

    [Fact]
    public void MaxPageSize_ShouldBeOneHundred()
    {
        PaginationParams.MaxPageSize.Should().Be(100);
    }
}
