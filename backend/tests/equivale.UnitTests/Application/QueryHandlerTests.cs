using equivale.Application.DTOs;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;
using FluentAssertions;

namespace equivale.UnitTests.Application;

/// <summary>
/// Testes de mapeamento e regras de negocio dos handlers.
/// Como os handlers dependem de repositorios MongoDB, testamos as entidades
/// e DTOs que eles manipulam.
/// </summary>
public class QueryHandlerTests
{
    [Fact]
    public void PagedResult_WithProducts_ShouldMapCorrectly()
    {
        var products = new List<Product>
        {
            new() { Id = "1", Title = "Notebook", PriceInEquivale = new Money(500m), Status = ItemStatus.Active },
            new() { Id = "2", Title = "Mouse", PriceInEquivale = new Money(50m), Status = ItemStatus.Active }
        };

        var result = new PagedResult<Product>
        {
            Items = products,
            Page = 1,
            PageSize = 10,
            TotalItems = 2
        };

        result.Items.Should().HaveCount(2);
        result.TotalPages.Should().Be(1);
        result.HasNext.Should().BeFalse();
        result.HasPrevious.Should().BeFalse();
    }

    [Fact]
    public void PagedResult_LargeDataSet_ShouldCalculateNavigation()
    {
        var result = new PagedResult<string>
        {
            Items = [],
            Page = 5,
            PageSize = 10,
            TotalItems = 97
        };

        result.TotalPages.Should().Be(10);
        result.HasPrevious.Should().BeTrue();
        result.HasNext.Should().BeTrue();
    }

    [Fact]
    public void PagedResult_LastPage_ShouldNotHaveNext()
    {
        var result = new PagedResult<string>
        {
            Items = [],
            Page = 10,
            PageSize = 10,
            TotalItems = 97
        };

        result.TotalPages.Should().Be(10);
        result.HasPrevious.Should().BeTrue();
        result.HasNext.Should().BeFalse();
    }

    [Fact]
    public void Transaction_WithCreditAndDebit_ShouldUpdateWallet()
    {
        var user = new User
        {
            Id = "u1",
            Email = new Email("user@test.com")
        };

        user.Credit(100m);
        user.WalletBalance.Amount.Should().Be(100m);

        user.Credit(50m);
        user.WalletBalance.Amount.Should().Be(150m);

        user.Debit(30m);
        user.WalletBalance.Amount.Should().Be(120m);
    }
}
