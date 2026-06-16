namespace equivale.Application.Configuration;

/// <summary>
/// Configuração da taxa de demurrage (retenção anti-inflação sobre saldo ocioso).
/// Padrão: 0,5% ao mês sobre o saldo DISPONÍVEL (WalletBalance), com isenções.
/// </summary>
public class DemurrageOptions
{
    public const string SectionName = "Demurrage";

    /// <summary>Taxa mensal aplicada sobre o saldo disponível ocioso (percentual). Default 0,5%.</summary>
    public decimal RatePercent { get; set; } = 0.5m;

    /// <summary>Saldo disponível abaixo do qual o usuário é isento (piso de proteção). Default 100 EQL.</summary>
    public decimal FloorEquivale { get; set; } = 100m;

    /// <summary>Usuários ativos (comprou/vendeu) nos últimos N dias são isentos. Default 30.</summary>
    public int InactivityDays { get; set; } = 30;
}
