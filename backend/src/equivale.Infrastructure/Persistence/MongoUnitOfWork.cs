using MongoDB.Driver;
using equivale.Domain.Interfaces;

namespace equivale.Infrastructure.Persistence;

/// <summary>
/// Implementacao de Unit of Work usando MongoDB Client Sessions.
/// Garante atomicidade em operacoes multi-colecao via sessao transacional.
/// </summary>
public sealed class MongoUnitOfWork : IUnitOfWork
{
    private readonly IMongoClient _mongoClient;

    public MongoUnitOfWork(IMongoClient mongoClient)
    {
        _mongoClient = mongoClient;
    }

    public async Task<TResult> ExecuteInTransactionAsync<TResult>(
        Func<IDbSession, CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default)
    {
        var clientSession = await _mongoClient.StartSessionAsync(cancellationToken: cancellationToken);

        try
        {
            clientSession.StartTransaction();

            var dbSession = new MongoDbSession(clientSession);
            var result = await operation(dbSession, cancellationToken);

            await clientSession.CommitTransactionAsync(cancellationToken);
            return result;
        }
        catch (Exception)
        {
            await clientSession.AbortTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task ExecuteInTransactionAsync(
        Func<IDbSession, CancellationToken, Task> operation,
        CancellationToken cancellationToken = default)
    {
        var clientSession = await _mongoClient.StartSessionAsync(cancellationToken: cancellationToken);

        try
        {
            clientSession.StartTransaction();

            var dbSession = new MongoDbSession(clientSession);
            await operation(dbSession, cancellationToken);

            await clientSession.CommitTransactionAsync(cancellationToken);
        }
        catch (Exception)
        {
            await clientSession.AbortTransactionAsync(cancellationToken);
            throw;
        }
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}
