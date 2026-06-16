namespace equivale.Domain.Exceptions;

public class ConcurrencyException : Exception
{
    public string? EntityId { get; }
    public long ExpectedVersion { get; }

    public ConcurrencyException(string message) : base(message) { }

    public ConcurrencyException(string entityType, string entityId, long expectedVersion)
        : base($"Conflito de concorrência ao atualizar {entityType} {entityId}. O documento foi modificado por outra operação.")
    {
        EntityId = entityId;
        ExpectedVersion = expectedVersion;
    }
}
