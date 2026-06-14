using MongoDB.Driver;
using equivale.Domain.Entities;

namespace equivale.Infrastructure.Persistence;

public class MongoDbContext
{
    public IMongoDatabase Database { get; }

    public MongoDbContext(IMongoClient mongoClient, MongoDbSettings settings)
    {
        Database = mongoClient.GetDatabase(settings.DatabaseName);
    }

    public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    public IMongoCollection<Product> Products => Database.GetCollection<Product>("products");
    public IMongoCollection<Service> Services => Database.GetCollection<Service>("services");
    public IMongoCollection<Community> Communities => Database.GetCollection<Community>("communities");
    public IMongoCollection<Transaction> Transactions => Database.GetCollection<Transaction>("transactions");
    public IMongoCollection<Review> Reviews => Database.GetCollection<Review>("reviews");
}
