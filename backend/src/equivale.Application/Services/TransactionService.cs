using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;

namespace equivale.Application.Services;

public interface ITransactionService
{
    Task<TransactionDto> CreateAsync(string buyerId, CreateTransactionDto dto, CancellationToken ct = default);
    Task<TransactionDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<PagedResult<TransactionDto>> GetByUserIdAsync(string userId, string? role, int page, int pageSize, CancellationToken ct = default);
    Task<TransactionDto?> ConfirmByBuyerAsync(string transactionId, string userId, CancellationToken ct = default);
    Task<TransactionDto?> ConfirmBySellerAsync(string transactionId, string userId, CancellationToken ct = default);
    Task<TransactionDto?> MarkShippedAsync(string transactionId, string userId, CancellationToken ct = default);
    Task<TransactionDto?> MarkDeliveredAsync(string transactionId, string userId, CancellationToken ct = default);
    Task<TransactionDto?> CancelAsync(string transactionId, string userId, CancellationToken ct = default);
}

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IProductRepository _productRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public TransactionService(
        ITransactionRepository transactionRepository,
        IProductRepository productRepository,
        IServiceRepository serviceRepository,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _transactionRepository = transactionRepository;
        _productRepository = productRepository;
        _serviceRepository = serviceRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<TransactionDto> CreateAsync(string buyerId, CreateTransactionDto dto, CancellationToken ct = default)
    {
        var buyer = await _userRepository.GetByIdAsync(buyerId, ct)
            ?? throw new InvalidOperationException("Comprador não encontrado.");

        string sellerId;
        string itemTitle;
        decimal unitPrice;
        bool isProduct = dto.ItemType.Equals("Product", StringComparison.OrdinalIgnoreCase);

        if (isProduct)
        {
            var product = await _productRepository.GetByIdAsync(dto.ItemId, ct)
                ?? throw new InvalidOperationException("Produto não encontrado.");

            if (product.SellerId == buyerId)
                throw new InvalidOperationException("Você não pode comprar seu próprio produto.");

            if (product.Stock < dto.Quantity)
                throw new InvalidOperationException("Estoque insuficiente para esta quantidade.");

            sellerId = product.SellerId;
            itemTitle = product.Title;
            unitPrice = product.PriceInEquivale.Amount;
        }
        else
        {
            var service = await _serviceRepository.GetByIdAsync(dto.ItemId, ct)
                ?? throw new InvalidOperationException("Serviço não encontrado.");

            if (service.ProviderId == buyerId)
                throw new InvalidOperationException("Você não pode contratar seu próprio serviço.");

            sellerId = service.ProviderId;
            itemTitle = service.Title;
            unitPrice = service.PriceInEquivale.Amount;
        }

        var total = unitPrice * dto.Quantity;

        if (buyer.WalletBalance.Amount < total)
            throw new InvalidOperationException($"Saldo insuficiente. Você tem {buyer.WalletBalance.Amount} EQL mas precisa de {total} EQL.");

        // RESERVA o valor (escrow) — debita do comprador imediatamente
        buyer.Debit(total);
        await _userRepository.UpdateAsync(buyer, ct);

        var transaction = new Transaction
        {
            BuyerId = buyerId,
            SellerId = sellerId,
            ItemType = isProduct ? TransactionItemType.Product : TransactionItemType.Service,
            ItemId = dto.ItemId,
            ItemTitle = itemTitle,
            Quantity = dto.Quantity,
            UnitPrice = new Money(unitPrice),
            TotalPrice = new Money(total),
            Status = TransactionStatus.Pending,
            OrderStatus = OrderStatus.OrderPlaced,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _transactionRepository.AddAsync(transaction, ct);
        return _mapper.Map<TransactionDto>(transaction);
    }

    public async Task<TransactionDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(id, ct);
        return t is null ? null : await EnrichAsync(t, ct);
    }

    public async Task<PagedResult<TransactionDto>> GetByUserIdAsync(string userId, string? role, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _transactionRepository.GetByUserIdAsync(userId, role, page, pageSize, ct);
        var dtos = await Task.WhenAll(items.Select(t => EnrichAsync(t, ct)));
        return new PagedResult<TransactionDto>
        {
            Items = dtos.ToList(),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<TransactionDto?> ConfirmByBuyerAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || t.BuyerId != userId) return null;
        return await ExecuteStatusChange(t, () => t.ConfirmByBuyer(), ct);
    }

    public async Task<TransactionDto?> ConfirmBySellerAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || t.SellerId != userId) return null;
        return await ExecuteStatusChange(t, () => t.ConfirmBySeller(), ct);
    }

    public async Task<TransactionDto?> MarkShippedAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || t.SellerId != userId) return null;
        return await ExecuteStatusChange(t, () => t.MarkShipped(), ct);
    }

    public async Task<TransactionDto?> MarkDeliveredAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || t.BuyerId != userId) return null;
        return await ExecuteStatusChange(t, () => t.MarkDelivered(), ct);
    }

    public async Task<TransactionDto?> CancelAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || (t.BuyerId != userId && t.SellerId != userId)) return null;
        return await ExecuteStatusChange(t, () => t.Cancel(), ct, isCancel: true);
    }

    private async Task<TransactionDto> ExecuteStatusChange(Transaction t, Action action, CancellationToken ct, bool isCancel = false)
    {
        var wasCompleted = t.Status == TransactionStatus.Completed;
        action();

        if (!wasCompleted && t.Status == TransactionStatus.Completed)
            await CompleteTransactionAsync(t, ct);

        if (isCancel)
            await RefundBuyerAsync(t, ct);

        await _transactionRepository.UpdateAsync(t, ct);
        return await EnrichAsync(t, ct);
    }

    private async Task CompleteTransactionAsync(Transaction t, CancellationToken ct)
    {
        // Credita o vendedor (libera o escrow)
        var seller = await _userRepository.GetByIdAsync(t.SellerId, ct);
        if (seller is not null)
        {
            seller.Credit(t.TotalPrice.Amount);
            await _userRepository.UpdateAsync(seller, ct);
        }

        // Decrementa estoque
        if (t.ItemType == TransactionItemType.Product)
        {
            var product = await _productRepository.GetByIdAsync(t.ItemId, ct);
            if (product is not null)
            {
                product.Stock = Math.Max(0, product.Stock - t.Quantity);
                if (product.Stock == 0) product.Status = ItemStatus.Sold;
                await _productRepository.UpdateAsync(product, ct);
            }
        }
    }

    private async Task RefundBuyerAsync(Transaction t, CancellationToken ct)
    {
        var buyer = await _userRepository.GetByIdAsync(t.BuyerId, ct);
        if (buyer is not null)
        {
            buyer.Credit(t.TotalPrice.Amount);
            await _userRepository.UpdateAsync(buyer, ct);
        }
    }

    private async Task<TransactionDto> EnrichAsync(Transaction t, CancellationToken ct)
    {
        var dto = _mapper.Map<TransactionDto>(t);
        var users = await _userRepository.GetByIdsAsync(new[] { t.BuyerId, t.SellerId }, ct);
        var userMap = users.ToDictionary(u => u.Id);
        return dto with
        {
            BuyerName = userMap.TryGetValue(t.BuyerId, out var b) ? b.Name : null,
            SellerName = userMap.TryGetValue(t.SellerId, out var s) ? s.Name : null
        };
    }
}
