using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using equivale.Domain.ValueObjects;

namespace equivale.Infrastructure.Serialization;

/// <summary>
/// Serializa o VO Money como decimal plain no MongoDB.
/// Evita que o MongoDB crie um subdocumento { Amount: 123.45 }.
/// </summary>
public sealed class MoneyBsonSerializer : SerializerBase<Money>
{
    public override Money Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var reader = context.Reader;
        if (reader.CurrentBsonType == BsonType.Null)
        {
            reader.ReadNull();
            return null!;
        }

        return new Money((decimal)reader.ReadDecimal128());
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, Money value)
    {
        context.Writer.WriteDecimal128(value.Amount);
    }
}
