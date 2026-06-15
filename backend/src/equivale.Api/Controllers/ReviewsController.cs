using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Domain.Entities;
using equivale.Domain.Interfaces;
using equivale.Application.Services;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IBaseRepository<Review> _reviewRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ITransactionService _transactionService;

    public ReviewsController(
        IBaseRepository<Review> reviewRepository,
        IUserRepository userRepository,
        ITransactionRepository transactionRepository,
        ITransactionService transactionService)
    {
        _reviewRepository = reviewRepository;
        _userRepository = userRepository;
        _transactionRepository = transactionRepository;
        _transactionService = transactionService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<ReviewWithUserDto>>> GetByUser(string userId, CancellationToken ct)
    {
        var allReviews = await _reviewRepository.GetAllAsync(ct);
        var userReviews = allReviews.Where(r => r.TargetUserId == userId).ToList();

        var reviewerIds = userReviews.Select(r => r.ReviewerId).Distinct();
        var users = await _userRepository.GetByIdsAsync(reviewerIds, ct);
        var userMap = users.ToDictionary(u => u.Id);

        var result = userReviews.Select(r => new ReviewWithUserDto(
            r.Id, r.Rating, r.Comment, r.ItemType, r.CreatedAt,
            r.ReviewerId,
            userMap.TryGetValue(r.ReviewerId, out var u) ? u.Name : null,
            userMap.TryGetValue(r.ReviewerId, out var u2) ? u2.AvatarUrl : null
        )).ToList();

        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Review>> Create([FromBody] CreateReviewRequest req, CancellationToken ct)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Verify transaction exists and delivery is confirmed
        if (!string.IsNullOrEmpty(req.TransactionId))
        {
            var transaction = await _transactionRepository.GetByIdAsync(req.TransactionId, ct);
            if (transaction is null)
                return BadRequest(new { error = "Transação não encontrada." });

            if (transaction.Status != Domain.Enums.TransactionStatus.Delivered && transaction.Status != Domain.Enums.TransactionStatus.Finished)
                return BadRequest(new { error = "A entrega precisa estar confirmada para avaliar." });

            if (transaction.BuyerId != userId && transaction.SellerId != userId)
                return Forbid();

            var targetId = transaction.BuyerId == userId ? transaction.SellerId : transaction.BuyerId;

            // Check for existing review
            var existing = await _reviewRepository.GetAllAsync(ct);
            if (existing.Any(r => r.TransactionId == req.TransactionId && r.ReviewerId == userId))
                return BadRequest(new { error = "Você já avaliou esta transação." });

            var review = new Review
            {
                ReviewerId = userId,
                TargetUserId = targetId,
                TransactionId = req.TransactionId,
                ItemId = transaction.ItemId,
                ItemType = transaction.ItemType.ToString(),
                Rating = req.Rating,
                Comment = req.Comment,
                CreatedAt = DateTime.UtcNow,
            };

            await _reviewRepository.AddAsync(review, ct);

            // If buyer is reviewing and transaction is Delivered, finish it (libera pagamento)
            if (transaction.BuyerId == userId && transaction.Status == Domain.Enums.TransactionStatus.Delivered)
            {
                try { await _transactionService.FinishTransactionAsync(req.TransactionId, ct); }
                catch (Exception ex) { Console.Error.WriteLine($"FinishTransactionAsync error: {ex.Message}"); }
            }

            return Ok(review);
        }

        return BadRequest(new { error = "TransactionId é obrigatório." });
    }
}

public record CreateReviewRequest(string TransactionId, int Rating, string? Comment);
public record ReviewWithUserDto(
    string Id, int Rating, string? Comment, string ItemType, DateTime CreatedAt,
    string ReviewerId, string? ReviewerName, string? ReviewerAvatarUrl);
