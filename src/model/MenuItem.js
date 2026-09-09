import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Burger", "Pizza", "Snacks", "Drinks", "Dessert", "Rice"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 20,
    },
    // গড় রেটিং (যেমন: 4.5 বা 4.8)
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // মোট রিভিউ সংখ্যা (যেমন: 12)
    numReviews: {
      type: Number,
      default: 0,
    },
    // কাস্টমারদের জমা দেওয়া রিভিউ তালিকা
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: {
          type: String,
          default: "Customer",
        },
        comment: {
          type: String,
          default: "",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;