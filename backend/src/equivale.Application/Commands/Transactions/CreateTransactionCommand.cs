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
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateTransactionCommandHandler(
        ITransactionRepository transactionRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _transactionRepository = transactionRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        return await _unitOfWork.ExecuteInTransactionAsync(async (session, ct) =>
        {
            var fromUser = await _userRepository.GetByIdAsync(request.Transaction.FromUserId, ct)
                ?? throw new InvalidOperationException("Sender user not found.");

            var toUser = await _userRepository.GetByIdAsync(request.Transaction.ToUserId, ct)
                ?? throw new InvalidOperationException("Recipient user not found.");

            fromUser.Debit(request.Transaction.Amount);
            toUser.Credit(request.Transaction.Amount);

            await _userRepository.UpdateAsync(fromUser, session, ct);
            await _userRepository.UpdateAsync(toUser, session, ct);

            var transaction = _mapper.Map<Domain.Entities.Transaction>(request.Transaction);
            await _transactionRepository.AddAsync(transaction, session, ct);

            return _mapper.Map<TransactionDto>(transaction);
        }, cancellationToken);
    }
}
