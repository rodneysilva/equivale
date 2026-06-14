using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;
using equivale.Application.Queries.Transactions;
using equivale.Application.Commands.Transactions;
using MediatR;

namespace equivale.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly IMediator _mediator;

    public TransactionService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<TransactionDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetTransactionByIdQuery(id), cancellationToken);

    public async Task<IReadOnlyList<TransactionDto>> GetByUserAsync(string userId, CancellationToken cancellationToken = default)
        => await _mediator.Send(new GetUserTransactionsQuery(userId), cancellationToken);

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, CancellationToken cancellationToken = default)
        => await _mediator.Send(new CreateTransactionCommand(dto), cancellationToken);
}
