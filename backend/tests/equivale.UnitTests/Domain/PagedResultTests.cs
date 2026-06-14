using equivale.Application.DTOs;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class PagedResultTests
{
    [Fact]
    public void TotalPages_ShouldCalculateCorrectly()
    {
        var result = new PagedResult<string>
        {
            Items = new List<string> { "a", "b" },
            Page = 1, PageSize = 2, TotalItems = 10
        };
        result.TotalPages.Should().Be(5);
    }

    [Fact]
    public void TotalPages_WhenNotDivisible_ShouldRoundUp()
    {
        var result = new PagedResult<string>
        {
            Items = [],
            Page = 1, PageSize = 3, TotalItems = 10
        };
        result.TotalPages.Should().Be(4); // ceil(10/3) = 4
    }

    [Fact]
    public void TotalPages_WhenZeroItems_ShouldBeZero()
    {
        var result = new PagedResult<string>
        {
            Items = [], Page = 1, PageSize = 20, TotalItems = 0
        };
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public void HasPrevious_WhenPageOne_ShouldBeFalse()
    {
        var result = new PagedResult<string>
        {
            Items = [], Page = 1, PageSize = 10, TotalItems = 50
        };
        result.HasPrevious.Should().BeFalse();
    }

    [Fact]
    public void HasPrevious_WhenPageTwo_ShouldBeTrue()
    {
        var result = new PagedResult<string>
        {
            Items = [], Page = 2, PageSize = 10, TotalItems = 50
        };
        result.HasPrevious.Should().BeTrue();
    }

    [Fact]
    public void HasNext_WhenLastPage_ShouldBeFalse()
    {
        var result = new PagedResult<string>
        {
            Items = [], Page = 5, PageSize = 10, TotalItems = 50
        };
        result.HasNext.Should().BeFalse();
    }

    [Fact]
    public void HasNext_WhenNotLastPage_ShouldBeTrue()
    {
        var result = new PagedResult<string>
        {
            Items = [], Page = 1, PageSize = 10, TotalItems = 50
        };
        result.HasNext.Should().BeTrue();
    }
}
