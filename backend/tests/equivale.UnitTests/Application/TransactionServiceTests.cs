using AutoMapper;
using equivale.Application.Configuration;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using equivale.Application.Mappings;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;

namespace equivale.UnitTests.Application;

/// <summary>
/// Testes do TransactionService cobrindo o fluxo financeiro (escrow, taxa, stock).
/// Repositorios sao mockados com Moq; IUnitOfWork executa a operacao inline (sem Mongo real);
/// o IMapper usa o MappingProfile real para validar o EnrichAsync.
/// </summary>
public class TransactionServiceTests
{
    private readonly Mock<ITransactionRepository> _txRepo = new();
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly Mock<IServiceRepository> _serviceRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly IMapper _mapper;
    private readonly TransactionFeeOptions _feeOptions = new() { Percent = 2.0m, TreasuryUserEmail = "tesouraria@equivale.com" };

    private readonly User _buyer;
    private readonly User _seller;
    private readonly User _treasury;
    private readonly Product _product;

    public TransactionServiceTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _buyer = NewUser("buyer-1", "buyer@equivale.com");
        _seller = NewUser("seller-1", "seller@equivale.com");
        _treasury = NewUser("treasury-1", "tesouraria@equivale.com");

        _product = new Product
        {
            Id = "prod-1",
            SellerId = _seller.Id,
            Title = "Caderno",
            PriceInEquivale = new Money(100m),
            ShippingCost = 0m,
            Stock = 5,
            Status = ItemStatus.Active
        };
        _productRepo.Setup(r => r.GetByIdAsync(_product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_product);

        // UserRepository: GetByIdAsync resolvendo por Id, GetByEmailAsync por email,
        // GetByIdsAsync retornando todos os usuarios conhecidos para o EnrichAsync.
        _userRepo.Setup(r => r.GetByIdAsync(It.Is<string>(id => id == _buyer.Id), It.IsAny<CancellationToken>())).ReturnsAsync(_buyer);
        _userRepo.Setup(r => r.GetByIdAsync(It.Is<string>(id => id == _seller.Id), It.IsAny<CancellationToken>())).ReturnsAsync(_seller);
        _userRepo.Setup(r => r.GetByIdAsync(It.Is<string>(id => id == _treasury.Id), It.IsAny<CancellationToken>())).ReturnsAsync(_treasury);
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<Email>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Email e, CancellationToken _) => e.Address == _treasury.Email.Address ? _treasury : null);
        _userRepo.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IEnumerable<string> ids, CancellationToken _) =>
                new List<User> { _buyer, _seller, _treasury }.Where(u => ids.Contains(u.Id)).ToList());

        // UnitOfWork executa a operacao inline passando um dummy session.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(
                It.IsAny<Func<IDbSession, CancellationToken, Task>>(),
                It.IsAny<CancellationToken>()))
            .Returns((Func<IDbSession, CancellationToken, Task> op, CancellationToken ct) => op(Mock.Of<IDbSession>(), ct));
    }

    private static User NewUser(string id, string email)
        => new()
        {
            Id = id,
            Name = id,
            Email = new Email(email),
            PasswordHash = "x",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

    private TransactionService BuildService() => new(
        _txRepo.Object, _productRepo.Object, _serviceRepo.Object,
        _userRepo.Object, _unitOfWork.Object, _mapper,
        Options.Create(_feeOptions));

    private CreateTransactionDto BuyDto(int qty = 1) => new(_product.Id, "Product", qty, null);

    // -------------------- CreateAsync --------------------

    [Fact]
    public async Task CreateAsync_Should_BlockBuyerBalance_And_PersistOrderPlaced()
    {
        _buyer.Credit(500m);
        var service = BuildService();

        var dto = await service.CreateAsync(_buyer.Id, BuyDto(qty: 1));

        // buyer.Block(100): Wallet 400, Blocked 100
        ((decimal)_buyer.WalletBalance).Should().Be(400m);
        ((decimal)_buyer.BlockedBalance).Should().Be(100m);
        _userRepo.Verify(r => r.UpdateAsync(_buyer, It.IsAny<CancellationToken>()), Times.Once);

        dto.Status.Should().Be("OrderPlaced");
        dto.TotalPrice.Should().Be(100m);
        dto.BuyerId.Should().Be(_buyer.Id);
        dto.SellerId.Should().Be(_seller.Id);
        _txRepo.Verify(r => r.AddAsync(It.Is<Transaction>(t =>
            t.Status == TransactionStatus.OrderPlaced &&
            t.BuyerId == _buyer.Id &&
            t.SellerId == _seller.Id), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_InsufficientStock_ShouldThrow()
    {
        _buyer.Credit(500m);
        _product.Stock = 0;
        _productRepo.Setup(r => r.GetByIdAsync(_product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_product);
        var service = BuildService();

        var act = () => service.CreateAsync(_buyer.Id, BuyDto(qty: 1));

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Estoque insuficiente*");
        _txRepo.Verify(r => r.AddAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_BuyingOwnProduct_ShouldThrow()
    {
        _buyer.Credit(500m);
        _product.SellerId = _buyer.Id;
        _productRepo.Setup(r => r.GetByIdAsync(_product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_product);
        var service = BuildService();

        var act = () => service.CreateAsync(_buyer.Id, BuyDto(qty: 1));

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*próprio produto*");
    }

    [Fact]
    public async Task CreateAsync_InsufficientBalance_ShouldThrow()
    {
        _buyer.Credit(50m); // total=100, saldo=50
        _productRepo.Setup(r => r.GetByIdAsync(_product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_product);
        var service = BuildService();

        var act = () => service.CreateAsync(_buyer.Id, BuyDto(qty: 1));

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Saldo insuficiente*");
        ((decimal)_buyer.WalletBalance).Should().Be(50m);
        ((decimal)_buyer.BlockedBalance).Should().Be(0m);
        _userRepo.Verify(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ProductNotFound_ShouldThrow()
    {
        _buyer.Credit(500m);
        _productRepo.Setup(r => r.GetByIdAsync(_product.Id, It.IsAny<CancellationToken>())).ReturnsAsync((Product?)null);
        var service = BuildService();

        var act = () => service.CreateAsync(_buyer.Id, BuyDto());

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Produto não encontrado*");
    }

    // -------------------- CancelAsync --------------------

    [Fact]
    public async Task CancelAsync_Should_UnblockBuyerBalance_AndNotCreditSeller()
    {
        var tx = await PlaceTransactionAsync(qty: 1);

        var service = BuildService();
        var result = await service.CancelAsync(tx.Id, _buyer.Id);

        result.Should().NotBeNull();
        // Estorno: Blocked volta pra Wallet
        ((decimal)_buyer.WalletBalance).Should().Be(500m);
        ((decimal)_buyer.BlockedBalance).Should().Be(0m);
        // Vendedor nunca foi creditado
        ((decimal)_seller.WalletBalance).Should().Be(0m);
        result!.Status.Should().Be("Cancelled");
    }

    [Fact]
    public async Task CancelAsync_WhenFinished_ShouldThrow()
    {
        var tx = await PlaceTransactionAsync(qty: 1);
        AdvanceToDelivered(tx);

        var service = BuildService();
        await service.FinishTransactionAsync(tx.Id);

        var act = () => service.CancelAsync(tx.Id, _buyer.Id);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task CancelAsync_WhenBuyerNotInvolved_ShouldReturnNull()
    {
        var tx = await PlaceTransactionAsync(qty: 1);
        var service = BuildService();

        var result = await service.CancelAsync(tx.Id, "stranger");

        result.Should().BeNull();
    }

    // -------------------- FinishTransactionAsync --------------------

    [Fact]
    public async Task Finish_Should_ReleaseAndCredit_CorrectFeeAndStock()
    {
        var tx = await PlaceTransactionAsync(qty: 2); // total = 100 * 2 = 200
        AdvanceToDelivered(tx);

        var service = BuildService();
        await service.FinishTransactionAsync(tx.Id);

        // Buyer: blocked zerado, saldo permanece 300 (500 - 200 bloqueados)
        ((decimal)_buyer.BlockedBalance).Should().Be(0m);
        ((decimal)_buyer.WalletBalance).Should().Be(300m);
        // Seller recebeu 200 - 2% fee (4) = 196
        ((decimal)_seller.WalletBalance).Should().Be(196m);
        // Tesouraria recebeu a taxa
        ((decimal)_treasury.WalletBalance).Should().Be(4m);
        // Taxa registrada na transacao
        tx.FeeAmount.Should().Be(4m);
        tx.Status.Should().Be(TransactionStatus.Finished);
        // Stock decrementado em 2 (5 -> 3)
        _product.Stock.Should().Be(3);
        _product.Status.Should().Be(ItemStatus.Active);
    }

    [Fact]
    public async Task Finish_WhenStockReachesZero_ShouldMarkSold()
    {
        _product.Stock = 2;
        var tx = await PlaceTransactionAsync(qty: 2);
        AdvanceToDelivered(tx);

        var service = BuildService();
        await service.FinishTransactionAsync(tx.Id);

        _product.Stock.Should().Be(0);
        _product.Status.Should().Be(ItemStatus.Sold);
    }

    [Fact]
    public async Task Finish_WhenNotDelivered_ShouldThrow()
    {
        _buyer.Credit(500m);
        var tx = await PlaceTransactionAsync(qty: 1); // ainda OrderPlaced

        var service = BuildService();
        var act = () => service.FinishTransactionAsync(tx.Id);

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*entrega precisa estar confirmada*");
    }

    [Theory]
    [MemberData(nameof(FeeCases))]
    public async Task Finish_FeeCalculation_ShouldMatch(decimal unitPrice, decimal feePercent, decimal expectedFee)
    {
        var buyer = NewUser("b-fee", "bfee@equivale.com");
        var seller = NewUser("s-fee", "sfee@equivale.com");
        buyer.Credit(unitPrice * 10);
        var product = new Product
        {
            Id = "p-fee", SellerId = seller.Id, Title = "X",
            PriceInEquivale = new Money(unitPrice), ShippingCost = 0m, Stock = 10
        };

        _userRepo.Setup(r => r.GetByIdAsync(buyer.Id, It.IsAny<CancellationToken>())).ReturnsAsync(buyer);
        _userRepo.Setup(r => r.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _productRepo.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);

        var tx = new Transaction
        {
            Id = "tx-fee", BuyerId = buyer.Id, SellerId = seller.Id,
            ItemType = TransactionItemType.Product, ItemId = product.Id, ItemTitle = "X",
            Quantity = 1, UnitPrice = new Money(unitPrice), ShippingCost = 0m,
            TotalPrice = new Money(unitPrice),
            Status = TransactionStatus.OrderPlaced,
            OrderPlacedAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        _txRepo.Setup(r => r.GetByIdAsync(tx.Id, It.IsAny<CancellationToken>())).ReturnsAsync(tx);
        AdvanceToDelivered(tx);

        var opts = new TransactionFeeOptions { Percent = feePercent, TreasuryUserEmail = "tesouraria@equivale.com" };
        var service = new TransactionService(
            _txRepo.Object, _productRepo.Object, _serviceRepo.Object,
            _userRepo.Object, _unitOfWork.Object, _mapper, Options.Create(opts));

        await service.FinishTransactionAsync(tx.Id);

        tx.FeeAmount.Should().Be(expectedFee);
        ((decimal)seller.WalletBalance).Should().Be(unitPrice - expectedFee);
    }

    [Fact]
    public async Task Finish_WhenTransactionNotFound_ShouldThrow()
    {
        var service = BuildService();
        var act = () => service.FinishTransactionAsync("missing");
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*não encontrada*");
    }

    // -------------------- helpers de fluxo --------------------

    /// <summary>Cria a transacao via o proprio service para reaproveitar toda a logica de Block.</summary>
    private async Task<Transaction> PlaceTransactionAsync(int qty)
    {
        _buyer.Credit(500m);
        _productRepo.Setup(r => r.GetByIdAsync(_product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_product);

        Transaction? captured = null;
        _txRepo.Setup(r => r.AddAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()))
            .Callback<Transaction, CancellationToken>((t, _) => captured = t)
            .Returns(Task.CompletedTask);

        var service = BuildService();
        await service.CreateAsync(_buyer.Id, BuyDto(qty));

        var tx = captured!;
        _txRepo.Setup(r => r.GetByIdAsync(tx.Id, It.IsAny<CancellationToken>())).ReturnsAsync(tx);
        return tx;
    }

    private static void AdvanceToDelivered(Transaction tx)
    {
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK");
        tx.BuyerConfirmDelivery();
    }

    public static IEnumerable<object[]> FeeCases => new[]
    {
        new object[] { 100m,   2.0m, 2m   },  // 100 -> fee 2
        new object[] { 50m,    2.0m, 1m   },  // 50 -> fee 1
        new object[] { 99.99m, 2.0m, 2m   },  // 99.99 * 0.02 = 1.9998 -> arredonda 2
        new object[] { 1000m,  2.0m, 20m  },
        new object[] { 100m,   0m,   0m   },  // fee 0% -> sem tesouraria
    };
}
