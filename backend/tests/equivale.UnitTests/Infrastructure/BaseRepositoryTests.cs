using Microsoft.Extensions.Options;
using Moq;
using MongoDB.Driver;
using equivale.Infrastructure.Persistence;
using equivale.Infrastructure.Repositories;

namespace equivale.UnitTests.Infrastructure;

public class BaseRepositoryTests
{
    [Fact]
    public async Task AddAsync_ShouldAssignAnId_WhenEntityHasNoId()
    {
        var mongoClient = new Mock<IMongoClient>();
        var mongoDatabase = new Mock<IMongoDatabase>();
        var mongoCollection = new Mock<IMongoCollection<TestEntity>>();

        mongoClient
            .Setup(client => client.GetDatabase(It.IsAny<string>(), It.IsAny<MongoDatabaseSettings>()))
            .Returns(mongoDatabase.Object);

        mongoDatabase
            .Setup(database => database.GetCollection<TestEntity>(It.IsAny<string>(), It.IsAny<MongoCollectionSettings>()))
            .Returns(mongoCollection.Object);

        mongoCollection
            .Setup(collection => collection.InsertOneAsync(
                It.IsAny<TestEntity>(),
                It.IsAny<InsertOneOptions>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var context = new MongoDbContext(mongoClient.Object, Options.Create(new MongoDbSettings { DatabaseName = "equivale" }));
        var repository = new BaseRepository<TestEntity>(context);
        var entity = new TestEntity();

        await repository.AddAsync(entity);

        Assert.False(string.IsNullOrWhiteSpace(entity.Id));
        mongoCollection.Verify(collection => collection.InsertOneAsync(
            It.Is<TestEntity>(item => !string.IsNullOrWhiteSpace(item.Id)),
            It.IsAny<InsertOneOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    public sealed class TestEntity
    {
        public string Id { get; set; } = string.Empty;
    }
}
