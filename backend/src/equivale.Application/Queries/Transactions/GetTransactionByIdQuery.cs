using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Transactions;

public record GetTransactionByIdQuery(string Id) : IRequest<TransactionDto?>;

public class GetTransactionByIdQueryHandler : IRequestHandler<GetTransactionByIdQuery, TransactionDto?>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;

    public GetTransactionByIdQueryHandler(ITransactionRepository transactionRepository, IMapper mapper)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
    }

    public async Task<TransactionDto?> Handle(GetTransactionByIdQuery request, CancellationToken cancellationToken)
    {
        var transaction = await _transactionRepository.GetByIdAsync(request.Id, cancellationToken);
        return transaction is null ? null : _mapper.Map<TransactionDto>(transaction);
    }
}
