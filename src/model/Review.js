import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    serviceExperience: {
      type: [String],
      default: []
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    }
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ orderId: 1, menuItem: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
