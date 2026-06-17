using System.Threading;
using System.Threading.Tasks;
using equivale.Application.Configuration;
using equivale.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace equivale.Api.BackgroundServices;

/// <summary>
/// Aplica o demurrage automaticamente uma vez por mês (ScheduleDay), em background.
/// Estado persistido em "schedulerstate" (restart-safe e idempotente: só roda
/// se o mês corrente ainda não foi executado). Usa IDemurrageService via escopo.
/// </summary>
public class DemurrageSchedulerHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DemurrageSchedulerHostedService> _logger;

    public DemurrageSchedulerHostedService(IServiceScopeFactory scopeFactory, ILogger<DemurrageSchedulerHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DemurrageScheduler iniciado.");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var options = scope.ServiceProvider.GetRequiredService<IOptions<DemurrageOptions>>().Value;
                var ctx = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

                var delayHours = options.CheckIntervalHours > 0 ? options.CheckIntervalHours : 6;
                if (options.Enabled)
                {
                    await TryRunAsync(scope, options, ctx, stoppingToken);
                }
                await Task.Delay(TimeSpan.FromHours(delayHours), stoppingToken);
            }
            catch (TaskCanceledException) { /* shutdown */ }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Erro no ciclo do DemurrageScheduler; tentará novamente.");
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }

    private static string CurrentMonth() => System.DateTime.UtcNow.ToString("yyyy-MM");

    /// <summary>True se deve rodar neste mês (mês corrente != último executado) e já passou do ScheduleDay.</summary>
    internal static bool ShouldRun(BsonDocument? state, DemurrageOptions options, System.DateTime now)
    {
        var month = now.ToString("yyyy-MM");
        if (state != null && state.Contains("lastRunMonth") && state["lastRunMonth"].AsString == month)
            return false; // já executou neste mês
        return now.Day >= options.ScheduleDay;
    }

    private async Task TryRunAsync(IServiceScope scope, DemurrageOptions options, MongoDbContext ctx, CancellationToken ct)
    {
        var stateColl = ctx.Database.GetCollection<BsonDocument>("schedulerstate");
        var state = await stateColl.Find(Builders<BsonDocument>.Filter.Eq("_id", "demurrage")).FirstOrDefaultAsync(ct);

        if (!ShouldRun(state, options, System.DateTime.UtcNow))
            return;

        _logger.LogInformation("DemurrageScheduler: aplicando demurrage do mês {Month}...", CurrentMonth());
        var demurrage = scope.ServiceProvider.GetRequiredService<equivale.Application.Services.IDemurrageService>();
        var result = await demurrage.ApplyAsync(ct);
        _logger.LogInformation(
            "DemurrageScheduler concluído: processados={Processed}, isentos={Exempt}, cobrado={Charged} EQL.",
            result.Processed, result.Exempted, result.TotalCharged);

        var update = new BsonDocument
        {
            { "_id", "demurrage" },
            { "lastRunMonth", CurrentMonth() },
            { "lastRunAtUtc", System.DateTime.UtcNow },
            { "processed", result.Processed },
            { "exempted", result.Exempted },
            { "totalCharged", (double)result.TotalCharged },
        };
        await stateColl.ReplaceOneAsync(
            Builders<BsonDocument>.Filter.Eq("_id", "demurrage"),
            update, new ReplaceOptions { IsUpsert = true }, ct);
    }
}
