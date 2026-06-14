using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Reviews;

public record GetReviewByIdQuery(string Id) : IRequest<ReviewDto?>;

public class GetReviewByIdQueryHandler : IRequestHandler<GetReviewByIdQuery, ReviewDto?>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMapper _mapper;

    public GetReviewByIdQueryHandler(IReviewRepository reviewRepository, IMapper mapper)
    {
        _reviewRepository = reviewRepository;
        _mapper = mapper;
    }

    public async Task<ReviewDto?> Handle(GetReviewByIdQuery request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.Id, cancellationToken);
        return review is null ? null : _mapper.Map<ReviewDto>(review);
    }
}
