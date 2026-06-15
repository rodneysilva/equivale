using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Interfaces;
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
            ?? throw new InvalidOperationException("Buyer not found.");

        string sellerId;
        string itemTitle;
        decimal unitPrice;

        if (dto.ItemType.Equals("Product", StringComparison.OrdinalIgnoreCase))
        {
            var product = await _productRepository.GetByIdAsync(dto.ItemId, ct)
                ?? throw new InvalidOperationException("Product not found.");

            if (product.SellerId == buyerId)
                throw new InvalidOperationException("Cannot buy your own product.");

            if (product.Stock < dto.Quantity)
                throw new InvalidOperationException("Insufficient stock.");

            sellerId = product.SellerId;
            itemTitle = product.Title;
            unitPrice = product.PriceInEquivale.Amount;
        }
        else
        {
            var service = await _serviceRepository.GetByIdAsync(dto.ItemId, ct)
                ?? throw new InvalidOperationException("Service not found.");

            if (service.ProviderId == buyerId)
                throw new InvalidOperationException("Cannot buy your own service.");

            sellerId = service.ProviderId;
            itemTitle = service.Title;
            unitPrice = service.PriceInEquivale.Amount;
        }

        var total = unitPrice * dto.Quantity;

        if (buyer.WalletBalance.Amount < total)
            throw new InvalidOperationException("Insufficient balance.");

        // Debit buyer (escrow)
        buyer.Debit(total);
        await _userRepository.UpdateAsync(buyer, ct);

        var transaction = new Transaction
        {
            BuyerId = buyerId,
            SellerId = sellerId,
            ItemType = dto.ItemType.Equals("Product", StringComparison.OrdinalIgnoreCase) ? TransactionItemType.Product : TransactionItemType.Service,
            ItemId = dto.ItemId,
            ItemTitle = itemTitle,
            Quantity = dto.Quantity,
            UnitPrice = new Money(unitPrice),
            TotalPrice = new Money(total),
            Status = TransactionStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _transactionRepository.AddAsync(transaction, ct);
        return _mapper.Map<TransactionDto>(transaction);
    }

    public async Task<TransactionDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(id, ct);
        return t is null ? null : _mapper.Map<TransactionDto>(t);
    }

    public async Task<PagedResult<TransactionDto>> GetByUserIdAsync(string userId, string? role, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _transactionRepository.GetByUserIdAsync(userId, role, page, pageSize, ct);
        var dtos = items.Select(_mapper.Map<TransactionDto>).ToList();

        // Enrich with names
        var userIds = items.Select(t => t.BuyerId).Union(items.Select(t => t.SellerId)).Distinct();
        var users = await _userRepository.GetByIdsAsync(userIds, ct);
        var userMap = users.ToDictionary(u => u.Id);

        for (var i = 0; i < dtos.Count; i++)
        {
            var dto = dtos[i];
            string? buyerName = null, sellerName = null;
            if (userMap.TryGetValue(dto.BuyerId, out var buyer)) buyerName = buyer.Name;
            if (userMap.TryGetValue(dto.SellerId, out var seller)) sellerName = seller.Name;
            dtos[i] = dto with { BuyerName = buyerName, SellerName = sellerName };
        }

        return new PagedResult<TransactionDto>
        {
            Items = dtos,
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<TransactionDto?> ConfirmByBuyerAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || t.BuyerId != userId) return null;

        var wasCompleted = t.Status == TransactionStatus.Completed;
        t.ConfirmByBuyer();

        if (!wasCompleted && t.Status == TransactionStatus.Completed)
            await CompleteTransactionAsync(t, ct);

        await _transactionRepository.UpdateAsync(t, ct);
        return _mapper.Map<TransactionDto>(t);
    }

    public async Task<TransactionDto?> ConfirmBySellerAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || t.SellerId != userId) return null;

        var wasCompleted = t.Status == TransactionStatus.Completed;
        t.ConfirmBySeller();

        if (!wasCompleted && t.Status == TransactionStatus.Completed)
            await CompleteTransactionAsync(t, ct);

        await _transactionRepository.UpdateAsync(t, ct);
        return _mapper.Map<TransactionDto>(t);
    }

    public async Task<TransactionDto?> CancelAsync(string transactionId, string userId, CancellationToken ct = default)
    {
        var t = await _transactionRepository.GetByIdAsync(transactionId, ct);
        if (t is null || (t.BuyerId != userId && t.SellerId != userId)) return null;

        t.Cancel();

        // Refund buyer
        var buyer = await _userRepository.GetByIdAsync(t.BuyerId, ct);
        if (buyer is not null)
        {
            buyer.Credit(t.TotalPrice.Amount);
            await _userRepository.UpdateAsync(buyer, ct);
        }

        await _transactionRepository.UpdateAsync(t, ct);
        return _mapper.Map<TransactionDto>(t);
    }

    private async Task CompleteTransactionAsync(Transaction t, CancellationToken ct)
    {
        // Credit seller
        var seller = await _userRepository.GetByIdAsync(t.SellerId, ct);
        if (seller is not null)
        {
            seller.Credit(t.TotalPrice.Amount);
            await _userRepository.UpdateAsync(seller, ct);
        }

        // Decrement stock for products
        if (t.ItemType == TransactionItemType.Product)
        {
            var product = await _productRepository.GetByIdAsync(t.ItemId, ct);
            if (product is not null)
            {
                product.Stock = Math.Max(0, product.Stock - t.Quantity);
                if (product.Stock == 0)
                    product.Status = ItemStatus.Sold;
                await _productRepository.UpdateAsync(product, ct);
            }
        }
    }
}
