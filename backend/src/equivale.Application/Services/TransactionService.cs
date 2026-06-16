using AutoMapper;
using equivale.Application.DTOs;
using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Exceptions;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;
using equivale.Application.Configuration;
using Microsoft.Extensions.Options;

namespace equivale.Application.Services;

public interface ITransactionService
{
    Task<TransactionDto> CreateAsync(string buyerId, CreateTransactionDto dto, CancellationToken ct = default);
    Task<TransactionDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<PagedResult<TransactionDto>> GetByUserIdAsync(string userId, string? role, int page, int pageSize, CancellationToken ct = default);
    Task<TransactionDto?> SellerConfirmOrderAsync(string id, string userId, CancellationToken ct = default);
    Task<TransactionDto?> SellerShipAsync(string id, string userId, string? trackingInfo, CancellationToken ct = default);
    Task<TransactionDto?> BuyerConfirmDeliveryAsync(string id, string userId, CancellationToken ct = default);
    Task<TransactionDto?> CancelAsync(string id, string userId, CancellationToken ct = default);
    Task FinishTransactionAsync(string transactionId, CancellationToken ct = default);
}

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repo;
    private readonly IProductRepository _productRepo;
    private readonly IServiceRepository _serviceRepo;
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly TransactionFeeOptions _feeOptions;

    public TransactionService(ITransactionRepository repo, IProductRepository productRepo,
        IServiceRepository serviceRepo, IUserRepository userRepo, IUnitOfWork unitOfWork,
        IMapper mapper, IOptions<TransactionFeeOptions> feeOptions)
    {
        _repo = repo; _productRepo = productRepo; _serviceRepo = serviceRepo;
        _userRepo = userRepo; _unitOfWork = unitOfWork;
        _mapper = mapper;
        _feeOptions = feeOptions.Value;
    }

    public async Task<TransactionDto> CreateAsync(string buyerId, CreateTransactionDto dto, CancellationToken ct = default)
    {
        var buyer = await _userRepo.GetByIdAsync(buyerId, ct) ?? throw new InvalidOperationException("Comprador não encontrado.");
        bool isProduct = dto.ItemType.Equals("Product", StringComparison.OrdinalIgnoreCase);

        string sellerId, itemTitle; decimal unitPrice; decimal shipping = 0;

        if (isProduct)
        {
            var p = await _productRepo.GetByIdAsync(dto.ItemId, ct) ?? throw new InvalidOperationException("Produto não encontrado.");
            if (p.SellerId == buyerId) throw new InvalidOperationException("Você não pode comprar seu próprio produto.");
            if (p.Stock < dto.Quantity) throw new InvalidOperationException("Estoque insuficiente.");
            sellerId = p.SellerId; itemTitle = p.Title; unitPrice = p.PriceInEquivale.Amount; shipping = p.ShippingCost;
        }
        else
        {
            var s = await _serviceRepo.GetByIdAsync(dto.ItemId, ct) ?? throw new InvalidOperationException("Serviço não encontrado.");
            if (s.ProviderId == buyerId) throw new InvalidOperationException("Você não pode contratar seu próprio serviço.");
            sellerId = s.ProviderId; itemTitle = s.Title; unitPrice = s.PriceInEquivale.Amount;
        }

        var itemTotal = unitPrice * dto.Quantity;
        var total = itemTotal + shipping;

        if (buyer.WalletBalance.Amount < total)
            throw new InvalidOperationException($"Saldo insuficiente. Você tem {buyer.WalletBalance.Amount} EQL mas precisa de {total} EQL.");

        buyer.Block(total);
        try { await _userRepo.UpdateAsync(buyer, ct); }
        catch (ConcurrencyException) { throw new InvalidOperationException("Saldo alterado por outra operação, tente novamente."); }

        var tx = new Transaction
        {
            BuyerId = buyerId, SellerId = sellerId,
            ItemType = isProduct ? TransactionItemType.Product : TransactionItemType.Service,
            ItemId = dto.ItemId, ItemTitle = itemTitle,
            Quantity = dto.Quantity, UnitPrice = new Money(unitPrice), ShippingCost = shipping,
            TotalPrice = new Money(total),
            DeliveryAddress = isProduct ? dto.DeliveryAddress : null,
            Status = TransactionStatus.OrderPlaced,
            OrderPlacedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        };
        await _repo.AddAsync(tx, ct);
        return await EnrichAsync(tx, ct);
    }

    public async Task<TransactionDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(id, ct);
        return t is null ? null : await EnrichAsync(t, ct);
    }

    public async Task<PagedResult<TransactionDto>> GetByUserIdAsync(string userId, string? role, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _repo.GetByUserIdAsync(userId, role, page, pageSize, ct);
        var dtos = await Task.WhenAll(items.Select(t => EnrichAsync(t, ct)));
        return new PagedResult<TransactionDto> { Items = dtos.ToList(), Page = page, PageSize = pageSize, TotalItems = total };
    }

    public async Task<TransactionDto?> SellerConfirmOrderAsync(string id, string userId, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(id, ct);
        if (t is null || t.SellerId != userId) return null;
        t.SellerConfirmOrder();
        await _repo.UpdateAsync(t, ct);
        return await EnrichAsync(t, ct);
    }

    public async Task<TransactionDto?> SellerShipAsync(string id, string userId, string? trackingInfo, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(id, ct);
        if (t is null || t.SellerId != userId) return null;
        t.SellerShip(trackingInfo);
        await _repo.UpdateAsync(t, ct);
        return await EnrichAsync(t, ct);
    }

    public async Task<TransactionDto?> BuyerConfirmDeliveryAsync(string id, string userId, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(id, ct);
        if (t is null || t.BuyerId != userId) return null;
        t.BuyerConfirmDelivery();
        await _repo.UpdateAsync(t, ct);
        return await EnrichAsync(t, ct);
    }

    public async Task<TransactionDto?> CancelAsync(string id, string userId, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(id, ct);
        if (t is null || (t.BuyerId != userId && t.SellerId != userId)) return null;

        var buyer = await _userRepo.GetByIdAsync(t.BuyerId, ct);
        if (buyer is not null && buyer.BlockedBalance.Amount >= t.TotalPrice.Amount)
        {
            buyer.Unblock(t.TotalPrice.Amount);
            try { await _userRepo.UpdateAsync(buyer, ct); }
            catch (ConcurrencyException) { throw new InvalidOperationException("Erro de concorrência ao estornar saldo. Tente novamente."); }
        }

        t.Cancel();
        try { await _repo.UpdateAsync(t, ct); }
        catch (ConcurrencyException) { throw new InvalidOperationException("Erro de concorrência ao cancelar transação. Tente novamente."); }
        return await EnrichAsync(t, ct);
    }

    public async Task FinishTransactionAsync(string transactionId, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(transactionId, ct) ?? throw new InvalidOperationException("Transação não encontrada.");
        if (!t.CanFinish) throw new InvalidOperationException("A entrega precisa estar confirmada.");

        // Calcula taxa de transacao antes de abrir a transacao (pure computation)
        var feeRate = _feeOptions.Percent / 100m;
        var feeAmount = Math.Round(t.TotalPrice.Amount * feeRate, 2);
        var sellerPayout = t.TotalPrice.Amount - feeAmount;

        // Carrega entidades envolvidas (leitura fora da transacao para reduzir janela de lock)
        var buyer = await _userRepo.GetByIdAsync(t.BuyerId, ct);
        var seller = await _userRepo.GetByIdAsync(t.SellerId, ct);
        var treasury = feeAmount > 0 ? await EnsureTreasuryUserAsync(ct) : null;
        Product? product = null;
        if (t.ItemType == TransactionItemType.Product)
            product = await _productRepo.GetByIdAsync(t.ItemId, ct);

        // Executa todos os writes multi-documento dentro de uma transacao ACID.
        // Se qualquer update falhar no meio, o MongoDB faz rollback automatico (abort).
        await _unitOfWork.ExecuteInTransactionAsync(async (session, token) =>
        {
            // 1) Libera saldo bloqueado do comprador
            if (buyer is not null && buyer.BlockedBalance.Amount >= t.TotalPrice.Amount)
            {
                buyer.ReleaseBlocked(t.TotalPrice.Amount);
                await _userRepo.UpdateAsync(buyer, session, token);
            }

            // 2) Credita o vendedor (total menos a taxa)
            if (seller is not null)
            {
                seller.Credit(sellerPayout);
                await _userRepo.UpdateAsync(seller, session, token);
            }

            // 3) Credita a taxa na tesouraria (agora atomico com o restante)
            if (feeAmount > 0 && treasury is not null)
            {
                treasury.Credit(feeAmount);
                await _userRepo.UpdateAsync(treasury, session, token);
            }

            // 4) Decrementa estoque (apenas produtos)
            if (product is not null)
            {
                product.Stock = Math.Max(0, product.Stock - t.Quantity);
                if (product.Stock == 0) product.Status = ItemStatus.Sold;
                await _productRepo.UpdateAsync(product, session, token);
            }

            // 5) Marca a transacao como finalizada com a taxa registrada
            t.FeeAmount = feeAmount;
            t.Finish();
            await _repo.UpdateAsync(t, session, token);
        }, ct);
    }

    private User? _treasuryUser;
    private async Task<User?> EnsureTreasuryUserAsync(CancellationToken ct)
    {
        if (_treasuryUser is not null) return _treasuryUser;
        var email = new Email(_feeOptions.TreasuryUserEmail);
        _treasuryUser = await _userRepo.GetByEmailAsync(email, ct);
        return _treasuryUser;
    }

    private async Task<TransactionDto> EnrichAsync(Transaction t, CancellationToken ct)
    {
        var dto = _mapper.Map<TransactionDto>(t);
        var users = await _userRepo.GetByIdsAsync(new[] { t.BuyerId, t.SellerId }, ct);
        var map = users.ToDictionary(u => u.Id);
        return dto with
        {
            BuyerName = map.TryGetValue(t.BuyerId, out var b) ? b.Name : null,
            SellerName = map.TryGetValue(t.SellerId, out var s) ? s.Name : null
        };
    }
}
