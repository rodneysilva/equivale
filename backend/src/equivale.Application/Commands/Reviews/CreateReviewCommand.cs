using AutoMapper;
using equivale.Application.DTOs;
using equivale.Domain.Interfaces;
using MediatR;

namespace equivale.Application.Commands.Reviews;

public record CreateReviewCommand(CreateReviewDto Review) : IRequest<ReviewDto>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewDto>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMapper _mapper;

    public CreateReviewCommandHandler(IReviewRepository reviewRepository, IMapper mapper)
    {
        _reviewRepository = reviewRepository;
        _mapper = mapper;
    }

    public async Task<ReviewDto> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var review = _mapper.Map<Domain.Entities.Review>(request.Review);
        await _reviewRepository.AddAsync(review, cancellationToken);
        return _mapper.Map<ReviewDto>(review);
    }
}
