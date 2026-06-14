using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Reviews;

public record GetReviewsByItemQuery(string ItemId) : IRequest<IReadOnlyList<ReviewDto>>;

public class GetReviewsByItemQueryHandler : IRequestHandler<GetReviewsByItemQuery, IReadOnlyList<ReviewDto>>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMapper _mapper;

    public GetReviewsByItemQueryHandler(IReviewRepository reviewRepository, IMapper mapper)
    {
        _reviewRepository = reviewRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ReviewDto>> Handle(GetReviewsByItemQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _reviewRepository.GetByItemIdAsync(request.ItemId, cancellationToken);
        return reviews.Select(_mapper.Map<ReviewDto>).ToList().AsReadOnly();
    }
}
