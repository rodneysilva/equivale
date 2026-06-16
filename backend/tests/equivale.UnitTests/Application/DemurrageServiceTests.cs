using equivale.Application.Configuration;
using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Exceptions;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using FluentAssertions;
using Moq;

namespace equivale.UnitTests.Application;

/// <summary>
/// Testes do cálculo de demurrage (taxa anti-inflação sobre saldo ocioso).
/// Cobre a lógica PURA EvaluateEligibility (sem DB): taxa de 0,5%, isenções por
/// piso e por atividade, e o caminho feliz do DemurrageService com repositórios mockados.
/// </summary>
public class DemurrageServiceTests
{
    private readonly DemurrageOptions _options = new()
    {
        RatePercent = 0.5m,
        FloorEquivale = 100m,
        InactivityDays = 30
    };

    // -------------------- EvaluateEligibility (pure calc) --------------------

    [Theory]
    [InlineData(1000, 5)]   // 1000 * 0.005 = 5
    [InlineData(200, 1)]    // 200 * 0.005 = 1
    [InlineData(10000, 50)] // 10000 * 0.005 = 50
    public void EvaluateEligibility_ShouldChargeHalfPercent(decimal balance, decimal expectedCharge)
    {
        var (isEligible, charge, _) = DemurrageService.EvaluateEligibility(balance, activeRecently: false, _options);

        isEligible.Should().BeTrue();
        charge.Should().Be(expectedCharge);
    }

    [Theory]
    [InlineData(99.99)]   // abaixo do piso 100
    [InlineData(100)]     // exatamente no piso (<=) -> isento
    [InlineData(0)]
    public void EvaluateEligibility_AtOrBelowFloor_ShouldExempt(decimal balance)
    {
        var (isEligible, charge, reason) = DemurrageService.EvaluateEligibility(balance, activeRecently: false, _options);

        isEligible.Should().BeFalse();
        charge.Should().Be(0m);
        reason.Should().Contain("piso");
    }

    [Fact]
    public void EvaluateEligibility_BelowFloorButHigh_ShouldNotExempt()
    {
        // 101 > piso 100 -> elegível: 0.505 -> arredonda 0.50 (Banker's)
        var (isEligible, charge, _) = DemurrageService.EvaluateEligibility(101m, activeRecently: false, _options);
        isEligible.Should().BeTrue();
        charge.Should().Be(0.5m);
    }

    [Fact]
    public void EvaluateEligibility_ActiveRecently_ShouldExempt_EvenWithHighBalance()
    {
        var (isEligible, charge, reason) = DemurrageService.EvaluateEligibility(5000m, activeRecently: true, _options);

        isEligible.Should().BeFalse();
        charge.Should().Be(0m);
        reason.Should().Contain("ativo");
    }

    [Fact]
    public void EvaluateEligibility_FloorCheckedBeforeActivity()
    {
        // Inativo mas saldo <= piso -> isento por piso (não por atividade)
        var (_, _, reason) = DemurrageService.EvaluateEligibility(50m, activeRecently: false, _options);
        reason.Should().Contain("piso");
    }

    [Fact]
    public void EvaluateEligibility_BankersRounding()
    {
        // 105 * 0.005 = 0.525 -> Banker's -> 0.52 (par)
        var (_, c1, _) = DemurrageService.EvaluateEligibility(105m, false, _options);
        c1.Should().Be(0.52m);

        // 115 * 0.005 = 0.575 -> Banker's -> 0.58 (par)
        var (_, c2, _) = DemurrageService.EvaluateEligibility(115m, false, _options);
        c2.Should().Be(0.58m);
    }

    [Fact]
    public void EvaluateEligibility_RespectsCustomRate()
    {
        var opts = new DemurrageOptions { RatePercent = 1m, FloorEquivale = 0m, InactivityDays = 30 };
        var (_, charge, _) = DemurrageService.EvaluateEligibility(1000m, false, opts);
        charge.Should().Be(10m); // 1% de 1000
    }

    // -------------------- DemurrageService (mocked repos) --------------------

    [Fact]
    public async Task PreviewAsync_ShouldNotDebit_AndListEligibility()
    {
        var (service, userRepo, _, _) = BuildService();
        var rich = NewUser("rich", 1000m);   // elegível: 5
        var poor = NewUser("poor", 50m);     // isento piso
        var users = new List<User> { rich, poor };
        userRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(users);

        var result = await service.PreviewAsync();

        result.TotalUsers.Should().Be(2);
        result.EligibleCount.Should().Be(1);
        result.ExemptedCount.Should().Be(1);
        result.TotalWouldCharge.Should().Be(5m);
        // Nada debitado (preview é dry-run)
        ((decimal)rich.WalletBalance).Should().Be(1000m);
        ((decimal)poor.WalletBalance).Should().Be(50m);
    }

    [Fact]
    public async Task ApplyAsync_ShouldDebitEligible_BurnWithoutCrediting()
    {
        var (service, userRepo, _, ledgerRepo) = BuildService();
        var rich = NewUser("rich", 1000m);
        var poor = NewUser("poor", 50m);
        var users = new List<User> { rich, poor };
        userRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(users);

        var result = await service.ApplyAsync();

        result.Charged.Should().Be(1);
        result.Exempted.Should().Be(1);
        result.TotalCharged.Should().Be(5m);
        // Queimado: rich perdeu 5, ninguém ganhou
        ((decimal)rich.WalletBalance).Should().Be(995m);
        ((decimal)poor.WalletBalance).Should().Be(50m);
        // Ledger gravou 1 entrada
        ledgerRepo.Verify(r => r.AddAsync(It.Is<DemurrageEntry>(e =>
            e.UserId == "rich" && e.Amount == 5m && e.BalanceBefore == 1000m && e.BalanceAfter == 995m),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ApplyAsync_OnConcurrencyConflict_ShouldSkip_AndContinue()
    {
        var (service, userRepo, _, ledgerRepo) = BuildService();
        var a = NewUser("a", 1000m);
        var b = NewUser("b", 2000m);
        var users = new List<User> { a, b };
        userRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(users);

        // Primeiro update (a) lança ConcurrencyException; segundo (b) sucede.
        var callCount = 0;
        userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Returns<User, CancellationToken>((u, _) =>
            {
                callCount++;
                if (u.Id == "a")
                    throw new ConcurrencyException("User", "a", 0);
                return Task.CompletedTask;
            });

        var result = await service.ApplyAsync();

        result.Charged.Should().Be(1);
        result.SkippedConcurrency.Should().Be(1);
        result.TotalCharged.Should().Be(10m); // só b (2000*0.005=10)
        // Ledger gravou apenas b
        ledgerRepo.Verify(r => r.AddAsync(It.IsAny<DemurrageEntry>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ApplyAsync_ActiveUser_ShouldBeExempt()
    {
        var (service, userRepo, txRepo, ledgerRepo) = BuildService();
        var active = NewUser("active", 5000m);
        var users = new List<User> { active };
        userRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(users);
        txRepo.Setup(r => r.WasUserActiveSinceAsync("active", It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await service.ApplyAsync();

        result.Charged.Should().Be(0);
        result.Exempted.Should().Be(1);
        ((decimal)active.WalletBalance).Should().Be(5000m);
        ledgerRepo.Verify(r => r.AddAsync(It.IsAny<DemurrageEntry>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // -------------------- helpers --------------------

    private static User NewUser(string id, decimal balance)
    {
        var u = new User
        {
            Id = id,
            Name = id,
            Email = new Email($"{id}@equivale.com"),
            PasswordHash = "x",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        if (balance > 0) u.Credit(balance);
        return u;
    }

    private (DemurrageService service,
             Moq.Mock<IUserRepository> userRepo,
             Moq.Mock<ITransactionRepository> txRepo,
             Moq.Mock<IBaseRepository<DemurrageEntry>> ledgerRepo) BuildService()
    {
        var userRepo = new Moq.Mock<IUserRepository>();
        var txRepo = new Moq.Mock<ITransactionRepository>();
        // Por padrão, todos inativos (preview/apply cobrem elegibilidade).
        txRepo.Setup(r => r.WasUserActiveSinceAsync(It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        var ledgerRepo = new Moq.Mock<IBaseRepository<DemurrageEntry>>();

        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger<DemurrageService>.Instance;

        var service = new DemurrageService(userRepo.Object, txRepo.Object, ledgerRepo.Object,
            Microsoft.Extensions.Options.Options.Create(_options), logger);
        return (service, userRepo, txRepo, ledgerRepo);
    }
}
