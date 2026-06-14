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

    public ValueTask DisposeAsync()
    {
        ClientSession.Dispose();
        return ValueTask.CompletedTask;
    }
}
