using System.Threading;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using equivale.Infrastructure.Serialization;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace equivale.Infrastructure.Persistence;

/// <summary>
/// Contexto MongoDB com registro de serializadores customizados para Value Objects.
/// </summary>
public sealed class MongoDbContext
{
    public IMongoDatabase Database { get; }

    public MongoDbContext(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        RegisterValueObjectSerializers();
        Database = mongoClient.GetDatabase(settings.Value.DatabaseName);
    }

    /// <summary>
    /// Inicia uma nova sessao transacional no MongoDB.
    /// Requer que o cluster esteja rodando como replica set (mesmo single-node).
    /// </summary>
    public async Task<IDbSession> StartSessionAsync(CancellationToken cancellationToken = default)
    {
        var clientSession = await Database.Client.StartSessionAsync(cancellationToken: cancellationToken);
        return new MongoDbSession(clientSession);
    }

    public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    public IMongoCollection<Product> Products => Database.GetCollection<Product>("products");
    public IMongoCollection<Service> Services => Database.GetCollection<Service>("services");
    public IMongoCollection<Community> Communities => Database.GetCollection<Community>("communities");
    public IMongoCollection<Transaction> Transactions => Database.GetCollection<Transaction>("transactions");
    public IMongoCollection<Review> Reviews => Database.GetCollection<Review>("reviews");

    /// <summary>
    /// Cria índices essenciais (idempotente). Chamado uma vez no startup.
    /// Status indexa o aggregation de stats (admin) e filtros por estado da transação.
    /// </summary>
    public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
    {
        var statusKeys = Builders<Transaction>.IndexKeys.Ascending(t => t.Status);
        await Transactions.Indexes.CreateOneAsync(
            new CreateIndexModel<Transaction>(statusKeys, new CreateIndexOptions { Background = true }),
            cancellationToken: cancellationToken);
    }

    private static int _serializersRegistered = 0;

    private static void RegisterValueObjectSerializers()
    {
        if (Interlocked.CompareExchange(ref _serializersRegistered, 1, 0) != 0)
            return;

        BsonSerializer.RegisterSerializer(new EmailBsonSerializer());
        BsonSerializer.RegisterSerializer(new MoneyBsonSerializer());
    }
}
