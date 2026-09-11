import mongoose from "mongoose";
import Review from "../model/Review.js";
import User from "../model/User.js";
import MenuItem from "../model/MenuItem.js";
import { OrderModel } from "../model/Order.js";

const allowedExperiences = new Set([
  "Fast Delivery",
  "Piping Hot",
  "Polite Rider",
  "Great Packaging"
]);

export const createReviewController = async (req, res) => {
  try {
    const { orderId, rating, comment = "", serviceExperience = [] } = req.body;
    const rawTargetId = req.body.menuItemId || req.body.foodId || req.body.itemId;
    const userId = req.headers.user_id;
    const targetId = rawTargetId?._id || rawTargetId?.id || rawTargetId;

    if (!orderId || !targetId || !mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ status: "fail", message: "Order and menu item are required" });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ status: "fail", message: "Rating must be between 1 and 5" });
    }

    const experiences = Array.isArray(serviceExperience)
      ? serviceExperience.filter((experience) => allowedExperiences.has(experience))
      : [];
    const cleanComment = String(comment).trim();
    if (cleanComment.length > 1000) {
      return res.status(400).json({ status: "fail", message: "Review comment is too long" });
    }

    const order = await OrderModel.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ status: "fail", message: "Reviews are available after delivery" });
    }

    const orderItem = order.items.find((item) => (
      String(item.menuItemId) === String(targetId) ||
      String(item._id) === String(targetId)
    ));
    if (!orderItem) {
      return res.status(400).json({ status: "fail", message: "This menu item is not part of the order" });
    }
    if (orderItem.isReviewed) {
      return res.status(409).json({ status: "fail", message: "This item has already been reviewed" });
    }

    const menuItemId = orderItem.menuItemId;
    const [user, menuItem] = await Promise.all([
      User.findById(userId).select("name").lean(),
      MenuItem.findById(menuItemId)
    ]);
    if (!menuItem) {
      return res.status(404).json({ status: "fail", message: "Food item not found" });
    }

    const review = await Review.create({
      orderId,
      menuItem: menuItemId,
      userId,
      customerName: user?.name || "Customer",
      rating: numericRating,
      serviceExperience: experiences,
      comment: cleanComment
    });

    orderItem.isReviewed = true;
    order.markModified("items");
    await order.save();

    menuItem.reviews.push({
      userId,
      userName: user?.name || "Customer",
      rating: numericRating,
      comment: cleanComment,
      createdAt: review.createdAt
    });
    menuItem.numReviews = menuItem.reviews.length;
    menuItem.rating = Number(
      (menuItem.reviews.reduce((total, item) => total + item.rating, 0) / menuItem.numReviews).toFixed(1)
    );
    await menuItem.save();

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Thank you for your feedback!",
      data: review
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ status: "fail", message: "This item has already been reviewed" });
    }
    console.error("Create review error:", error.message);
    return res.status(500).json({ status: "fail", message: "Unable to submit review" });
  }
};

export const getAdminReviewsController = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("menuItem", "name")
      .lean();

    return res.status(200).json({ status: "success", data: reviews });
  } catch (error) {
    console.error("Get admin reviews error:", error.message);
    return res.status(500).json({ status: "fail", message: "Unable to load reviews" });
  }
};
