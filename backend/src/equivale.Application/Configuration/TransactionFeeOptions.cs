namespace equivale.Application.Configuration;

public class TransactionFeeOptions
{
    public const string SectionName = "TransactionFee";
    public decimal Percent { get; set; } = 2.0m;
    public string TreasuryUserEmail { get; set; } = "tesouraria@equivale.com";
}
