using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using equivale.Domain.Entities;
using equivale.Domain.ValueObjects;
using equivale.Infrastructure.Serialization;
using Microsoft.Extensions.Options;

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

    public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    public IMongoCollection<Product> Products => Database.GetCollection<Product>("products");
    public IMongoCollection<Service> Services => Database.GetCollection<Service>("services");
    public IMongoCollection<Community> Communities => Database.GetCollection<Community>("communities");
    public IMongoCollection<Transaction> Transactions => Database.GetCollection<Transaction>("transactions");
    public IMongoCollection<Review> Reviews => Database.GetCollection<Review>("reviews");

    private static void RegisterValueObjectSerializers()
    {
        BsonSerializer.RegisterSerializer(new EmailBsonSerializer());
        BsonSerializer.RegisterSerializer(new MoneyBsonSerializer());
    }
}
