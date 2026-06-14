using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Queries.Reviews;

public record GetReviewsByTargetUserQuery(string TargetUserId) : IRequest<IReadOnlyList<ReviewDto>>;

public class GetReviewsByTargetUserQueryHandler : IRequestHandler<GetReviewsByTargetUserQuery, IReadOnlyList<ReviewDto>>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMapper _mapper;

    public GetReviewsByTargetUserQueryHandler(IReviewRepository reviewRepository, IMapper mapper)
    {
        _reviewRepository = reviewRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ReviewDto>> Handle(GetReviewsByTargetUserQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _reviewRepository.GetByTargetUserIdAsync(request.TargetUserId, cancellationToken);
        return reviews.Select(_mapper.Map<ReviewDto>).ToList().AsReadOnly();
    }
}
