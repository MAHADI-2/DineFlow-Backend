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
    const menuLookupId = mongoose.isValidObjectId(menuItemId) ? menuItemId : targetId;
    const [user, menuItemById] = await Promise.all([
      User.findById(userId).select("name").lean(),
      MenuItem.findById(menuLookupId)
    ]);
    const menuItem = menuItemById || await MenuItem.findOne({
      name: new RegExp(`^${String(orderItem.itemName || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
    });
    if (!menuItem) {
      return res.status(404).json({ status: "fail", message: "Food item not found" });
    }

    const review = await Review.create({
      orderId,
      menuItem: menuItem._id,
      userId,
      customerName: user?.name || "Customer",
      rating: numericRating,
      serviceExperience: experiences,
      comment: cleanComment
    });

    const currentReviews = Array.isArray(menuItem.reviews) ? menuItem.reviews : [];
    const nextReviewCount = currentReviews.length + 1;
    const nextRating = Number(
      ((currentReviews.reduce((total, item) => total + Number(item.rating || 0), 0) + numericRating) / nextReviewCount).toFixed(1)
    );

    await OrderModel.updateOne(
      { _id: order._id, "items._id": orderItem._id },
      { $set: { "items.$.isReviewed": true, updatedAt: new Date() } }
    );

    await MenuItem.updateOne({ _id: menuItem._id }, {
      $push: { reviews: {
      userId,
      userName: user?.name || "Customer",
      rating: numericRating,
      comment: cleanComment,
      createdAt: review.createdAt
      } },
      $set: { numReviews: nextReviewCount, rating: nextRating }
    });

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
