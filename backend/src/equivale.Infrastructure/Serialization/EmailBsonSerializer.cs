using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using equivale.Domain.ValueObjects;

namespace equivale.Infrastructure.Serialization;

/// <summary>
/// Serializa o VO Email como string plain no MongoDB.
/// Evita que o MongoDB crie um subdocumento { Address: "..." }.
/// </summary>
public sealed class EmailBsonSerializer : SerializerBase<Email>
{
    public override Email Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var reader = context.Reader;
        if (reader.CurrentBsonType == BsonType.Null)
        {
            reader.ReadNull();
            return null!;
        }

        return new Email(reader.ReadString());
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, Email value)
    {
        context.Writer.WriteString(value.Address);
    }
}
