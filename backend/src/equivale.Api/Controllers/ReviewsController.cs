using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using equivale.Application.DTOs;
using equivale.Application.Interfaces.Services;

namespace equivale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewDto dto, CancellationToken cancellationToken)
    {
        var review = await _reviewService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = review.Id }, review);
    }

    [HttpGet("item/{itemId}")]
    public async Task<ActionResult<IReadOnlyList<ReviewDto>>> GetByItem(string itemId, CancellationToken cancellationToken)
    {
        var reviews = await _reviewService.GetByItemAsync(itemId, cancellationToken);
        return Ok(reviews);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var review = await _reviewService.GetByIdAsync(id, cancellationToken);
        if (review is null) return NotFound();
        return Ok(review);
    }
}
