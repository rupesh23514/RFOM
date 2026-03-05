import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    images: { type: [String], default: [] }, // review photo URLs
    likes: { type: Number, default: 0 },

    // Detailed ratings (Zomato-style)
    foodRating: { type: Number, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    packagingRating: { type: Number, min: 1, max: 5 },

    // Owner reply
    ownerReply: { type: String, default: "" },
    ownerReplyDate: { type: Date },
  },
  { timestamps: true }
);

// One review per order
reviewSchema.index({ order: 1 }, { unique: true });
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
