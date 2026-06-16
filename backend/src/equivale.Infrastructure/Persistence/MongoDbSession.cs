using MongoDB.Driver;
using equivale.Domain.Interfaces;

namespace equivale.Infrastructure.Persistence;

/// <summary>
/// Adapter que envolve o IClientSessionHandle do MongoDB na abstracao IDbSession do Domain.
/// </summary>
internal sealed class MongoDbSession : IDbSession
{
    public IClientSessionHandle ClientSession { get; }
    public Guid SessionId { get; } = Guid.NewGuid();

    public MongoDbSession(IClientSessionHandle clientSession)
    {
        ClientSession = clientSession;
    }

    public void StartTransaction() => ClientSession.StartTransaction();

    public Task StartTransactionAsync(CancellationToken cancellationToken = default)
    {
        ClientSession.StartTransaction();
        return Task.CompletedTask;
    }

    public Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        => ClientSession.CommitTransactionAsync(cancellationToken);

    public Task AbortTransactionAsync(CancellationToken cancellationToken = default)
        => ClientSession.AbortTransactionAsync(cancellationToken);

    public ValueTask DisposeAsync()
    {
        ClientSession.Dispose();
        return ValueTask.CompletedTask;
    }
}
