namespace equivale.Domain.Interfaces;

/// <summary>
/// Abstracao de sessao transacional para o Domain.
/// Isola o dominio do tipo concreto IClientSessionHandle do MongoDB.
/// </summary>
public interface IDbSession : IAsyncDisposable
{
    /// <summary>
    /// Identificador unico da sessao (para debugging/logging).
    /// </summary>
    Guid SessionId { get; }
}
