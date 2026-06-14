using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Transactions;

public record CreateTransactionCommand(CreateTransactionDto Transaction) : IRequest<TransactionDto>;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public CreateTransactionCommandHandler(
        ITransactionRepository transactionRepository,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _transactionRepository = transactionRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        var fromUser = await _userRepository.GetByIdAsync(request.Transaction.FromUserId, cancellationToken)
            ?? throw new InvalidOperationException("Sender user not found.");
        var toUser = await _userRepository.GetByIdAsync(request.Transaction.ToUserId, cancellationToken)
            ?? throw new InvalidOperationException("Recipient user not found.");

        // Debit from sender
        fromUser.Debit(request.Transaction.Amount);
        // Credit to recipient
        toUser.Credit(request.Transaction.Amount);

        await _userRepository.UpdateAsync(fromUser, cancellationToken);
        await _userRepository.UpdateAsync(toUser, cancellationToken);

        var transaction = _mapper.Map<Domain.Entities.Transaction>(request.Transaction);
        await _transactionRepository.AddAsync(transaction, cancellationToken);
        return _mapper.Map<TransactionDto>(transaction);
    }
}
