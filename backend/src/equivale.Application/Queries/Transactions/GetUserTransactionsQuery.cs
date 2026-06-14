using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Transactions;

public record GetUserTransactionsQuery(string UserId) : IRequest<IReadOnlyList<TransactionDto>>;

public class GetUserTransactionsQueryHandler : IRequestHandler<GetUserTransactionsQuery, IReadOnlyList<TransactionDto>>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;

    public GetUserTransactionsQueryHandler(ITransactionRepository transactionRepository, IMapper mapper)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<TransactionDto>> Handle(GetUserTransactionsQuery request, CancellationToken cancellationToken)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return transactions.Select(_mapper.Map<TransactionDto>).ToList().AsReadOnly();
    }
}
