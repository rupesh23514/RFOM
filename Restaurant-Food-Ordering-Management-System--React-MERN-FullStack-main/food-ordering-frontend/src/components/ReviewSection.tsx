import { Star, ThumbsUp, MessageCircle, User } from "lucide-react";
import { Review } from "@/types";

type ReviewsData = {
  reviews: Review[];
  pagination: { total: number; page: number; pages: number };
  breakdown: Record<number, number>;
};

type Props = {
  restaurantId: string;
  reviewsData?: ReviewsData;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))}
  </div>
);

const ReviewSection = ({ restaurantId, reviewsData }: Props) => {
  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Ratings & Reviews
            </h2>
            <p className="text-sm text-gray-500">
              No reviews yet — be the first to review!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { reviews, breakdown, pagination } = reviewsData;
  const totalRatings = pagination.total;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Ratings & Reviews
          </h2>
          <p className="text-sm text-gray-500">
            {totalRatings} review{totalRatings !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Rating Overview (Zomato-style) */}
      <div className="flex items-start gap-8 mb-8 p-6 bg-gray-50 rounded-2xl">
        {/* Big Rating */}
        <div className="text-center min-w-[100px]">
          <div className="text-5xl font-bold text-gray-900">
            {avgRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-sm text-gray-500 mt-1">
            {totalRatings} rating{totalRatings !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-4">
                  {star}
                </span>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      star >= 4
                        ? "bg-green-500"
                        : star === 3
                        ? "bg-yellow-500"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            {/* User Info + Rating */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                  {typeof review.user === "object" && review.user?.image ? (
                    <img
                      src={review.user.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {typeof review.user === "object"
                      ? review.user?.name || "Anonymous"
                      : "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold text-white ${
                  review.rating >= 4
                    ? "bg-green-600"
                    : review.rating >= 3
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                {review.rating}
              </div>
            </div>

            {/* Detailed Ratings */}
            {(review.foodRating || review.deliveryRating || review.packagingRating) && (
              <div className="flex gap-4 mb-3 text-xs text-gray-500">
                {review.foodRating && (
                  <span>
                    Food: <strong>{review.foodRating}/5</strong>
                  </span>
                )}
                {review.deliveryRating && (
                  <span>
                    Delivery: <strong>{review.deliveryRating}/5</strong>
                  </span>
                )}
                {review.packagingRating && (
                  <span>
                    Packaging: <strong>{review.packagingRating}/5</strong>
                  </span>
                )}
              </div>
            )}

            {/* Comment */}
            {review.comment && (
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}

            {/* Owner Reply */}
            {review.ownerReply && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-orange-300 bg-orange-50 p-3 rounded-r-lg">
                <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Restaurant Response
                </p>
                <p className="text-sm text-gray-600">{review.ownerReply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
