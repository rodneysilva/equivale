using equivale.Application.Configuration;
using equivale.Domain.Entities;
using equivale.Domain.Exceptions;
using equivale.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace equivale.Application.Services;

public interface IDemurrageService
{
    Task<DemurragePreviewResult> PreviewAsync(CancellationToken ct = default);
    Task<DemurrageApplyResult> ApplyAsync(CancellationToken ct = default);
}

/// <summary>
/// Demurrage = taxa anti-inflação de 0,5%/mês sobre saldo DISPONÍVEL ocioso.
/// A taxa é QUEIMADA (User.Debit sem creditar ninguém), reduzindo a base monetária.
/// Isenções: saldo <= piso; usuário ativo (comprou/vendeu) nos últimos N dias.
/// Saldo BLOQUEADO (BlockedBalance em transações ativas) nunca é taxado.
/// </summary>
public class DemurrageService : IDemurrageService
{
    private readonly IUserRepository _userRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly IBaseRepository<DemurrageEntry> _ledgerRepo;
    private readonly DemurrageOptions _options;
    private readonly ILogger<DemurrageService> _logger;

    public DemurrageService(
        IUserRepository userRepo,
        ITransactionRepository transactionRepo,
        IBaseRepository<DemurrageEntry> ledgerRepo,
        IOptions<DemurrageOptions> options,
        ILogger<DemurrageService> logger)
    {
        _userRepo = userRepo;
        _transactionRepo = transactionRepo;
        _ledgerRepo = ledgerRepo;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<DemurragePreviewResult> PreviewAsync(CancellationToken ct = default)
    {
        var users = await _userRepo.GetAllAsync(ct);
        var since = DateTime.UtcNow.AddDays(-_options.InactivityDays);

        var items = new List<DemurragePreviewItem>(users.Count);
        decimal totalWouldCharge = 0m;
        int eligible = 0, exempt = 0;

        foreach (var u in users)
        {
            var balance = u.WalletBalance.Amount;
            var activeRecently = await _transactionRepo.WasUserActiveSinceAsync(u.Id, since, ct);
            var (isEligible, charge, reason) = EvaluateEligibility(balance, activeRecently, _options);

            items.Add(new DemurragePreviewItem(u.Id, u.Name, balance, charge, !isEligible, reason));
            if (isEligible) { eligible++; totalWouldCharge += charge; }
            else exempt++;
        }

        return new DemurragePreviewResult(items, users.Count, eligible, exempt, totalWouldCharge);
    }

    public async Task<DemurrageApplyResult> ApplyAsync(CancellationToken ct = default)
    {
        // NOTA DE IDEMPOTÊNCIA: ApplyAsync é DESTRUTIVO e NÃO protege contra execução
        // dupla no mesmo mês. É responsabilidade do admin acionar POST /demurrage/run
        // uma única vez por ciclo (idealmente via job agendado). O ledger (DemurrageEntry)
        // audita cada cobrança para reconciliação posterior.
        var users = await _userRepo.GetAllAsync(ct);
        var since = DateTime.UtcNow.AddDays(-_options.InactivityDays);

        int charged = 0, exempt = 0, skipped = 0;
        decimal totalCharged = 0m;

        foreach (var u in users)
        {
            var balanceBefore = u.WalletBalance.Amount;
            var activeRecently = await _transactionRepo.WasUserActiveSinceAsync(u.Id, since, ct);
            var (isEligible, charge, reason) = EvaluateEligibility(balanceBefore, activeRecently, _options);

            if (!isEligible)
            {
                exempt++;
                continue;
            }

            try
            {
                u.Debit(charge); // queima: debit sem creditar ninguém
                await _userRepo.UpdateAsync(u, ct); // optimistic locking (Version)

                var entry = new DemurrageEntry
                {
                    UserId = u.Id,
                    UserName = u.Name,
                    Amount = charge,
                    BalanceBefore = balanceBefore,
                    BalanceAfter = u.WalletBalance.Amount,
                    AppliedAt = DateTime.UtcNow,
                    Reason = reason,
                };
                await _ledgerRepo.AddAsync(entry, ct);

                totalCharged += charge;
                charged++;
                _logger.LogInformation(
                    "Demurrage cobrado: UserId={UserId} UserName={UserName} Amount={Amount} Before={Before} After={After}",
                    u.Id, u.Name, charge, balanceBefore, u.WalletBalance.Amount);
            }
            catch (ConcurrencyException ex)
            {
                // Concorrência (saldo mudou entre leitura e update): pula e continua o lote.
                skipped++;
                _logger.LogWarning(ex,
                    "Demurrage pulado por concorrência: UserId={UserId} (será cobrado no próximo ciclo)", u.Id);
            }
        }

        _logger.LogInformation(
            "Demurrage concluído: Users={Users} Charged={Charged} Exempt={Exempt} Skipped={Skipped} TotalCharged={Total}",
            users.Count, charged, exempt, skipped, totalCharged);

        return new DemurrageApplyResult(users.Count, charged, exempt, skipped, totalCharged);
    }

    /// <summary>
    /// Lógica PURA de elegibilidade/cálculo — isolada para teste unitário sem DB.
    /// Retorna (isEligible, chargeAmount, reason).
    /// </summary>
    public static (bool IsEligible, decimal Charge, string Reason) EvaluateEligibility(
        decimal balance, bool activeRecently, DemurrageOptions options)
    {
        // 1) Isenção por piso: saldo <= floor (protege contas pequenas)
        if (balance <= options.FloorEquivale)
            return (false, 0m, $"Isento: saldo ({balance:F2}) <= piso ({options.FloorEquivale:F2}).");

        // 2) Isenção por atividade: usuário comprou/vendeu nos últimos N dias
        if (activeRecently)
            return (false, 0m, $"Isento: ativo nos últimos {options.InactivityDays} dias.");

        // 3) Elegível: 0,5% do saldo disponível, arredondado em 2 casas (Banker's rounding, igual à Money).
        var rate = options.RatePercent / 100m;
        var charge = Math.Round(balance * rate, 2, MidpointRounding.ToEven);
        if (charge <= 0m)
            return (false, 0m, "Isento: taxa calculada = 0.");

        return (true, charge, $"Demurrage {options.RatePercent:F1}% sobre {balance:F2} = {charge:F2}.");
    }
}

public record DemurragePreviewItem(
    string UserId,
    string UserName,
    decimal Balance,
    decimal WouldCharge,
    bool Exempt,
    string Reason);

public record DemurragePreviewResult(
    IReadOnlyList<DemurragePreviewItem> Items,
    int TotalUsers,
    int EligibleCount,
    int ExemptedCount,
    decimal TotalWouldCharge);

public record DemurrageApplyResult(
    int Processed,
    int Charged,
    int Exempted,
    int SkippedConcurrency,
    decimal TotalCharged);
