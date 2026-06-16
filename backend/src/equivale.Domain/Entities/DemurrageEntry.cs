namespace equivale.Domain.Entities;

/// <summary>
/// Registro de auditoria de uma cobrança de demurrage (taxa anti-inflação).
/// A taxa é QUEIMADA (debitada sem creditar ninguém), reduzindo a base monetária.
/// Cada execução do ApplyAsync gera um DemurrageEntry por usuário debitado.
/// </summary>
public class DemurrageEntry
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public DateTime AppliedAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public long Version { get; set; }
}
