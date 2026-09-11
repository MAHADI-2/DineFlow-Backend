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
    const requestedTags = req.body.tags ?? serviceExperience;
    const rawTargetId = req.body.menuItemId || req.body.foodId || req.body.itemId;
    const requestedFoodName = req.body.foodName || req.body.itemName || req.body.name;
    const userId = req.headers.user_id;
    const targetId = rawTargetId?._id || rawTargetId?.id || rawTargetId;

    if (!orderId || (!targetId && !requestedFoodName)) {
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

    const normalizedRequestedName = String(requestedFoodName || "").trim().toLowerCase();
    const orderItem = order.items.find((item) => (
      (targetId && (
        String(item.menuItemId) === String(targetId) ||
        String(item._id) === String(targetId)
      )) ||
      (normalizedRequestedName && String(item.itemName || "").trim().toLowerCase() === normalizedRequestedName)
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
    const itemName = String(orderItem.itemName || requestedFoodName || "").trim();
    const escapedItemName = itemName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const menuItem = menuItemById || await MenuItem.findOne({
      name: { $regex: `^\\s*${escapedItemName.replace(/\\s+/g, "\\\\s+")}\\s*$`, $options: "i" }
    });
    if (!menuItem) {
      return res.status(404).json({ status: "fail", message: "Food item not found" });
    }

    const existingReview = await Review.findOne({ orderId, menuItem: menuItem._id, userId }).lean();
    if (existingReview) {
      const hasStoredReview = menuItem.reviews?.some((storedReview) => (
        String(storedReview.userId) === String(userId) &&
        Number(storedReview.rating) === Number(existingReview.rating) &&
        storedReview.comment === existingReview.comment
      ));

      if (!hasStoredReview) {
        menuItem.reviews.push({
          userId,
          userName: existingReview.customerName || user?.name || "Customer",
          rating: existingReview.rating,
          comment: existingReview.comment || "",
          tags: existingReview.serviceExperience || [],
          createdAt: existingReview.createdAt
        });
        menuItem.numReviews = menuItem.reviews.length;
        menuItem.rating = Number((menuItem.reviews.reduce(
          (total, storedReview) => total + Number(storedReview.rating || 0),
          0
        ) / menuItem.reviews.length).toFixed(1));
        await menuItem.save();
      }

      await OrderModel.updateOne(
        { _id: order._id, "items._id": orderItem._id },
        { $set: { "items.$.isReviewed": true, updatedAt: new Date() } }
      );

      return res.status(200).json({
        success: true,
        status: "success",
        message: "This item is already rated",
        alreadyReviewed: true,
        data: existingReview
      });
    }

    const menuItemQuery = mongoose.isValidObjectId(menuItem._id)
      ? { _id: menuItem._id }
      : { name: new RegExp(`^${String(menuItem.name).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
    const updatedItem = await MenuItem.findOneAndUpdate(
      menuItemQuery,
      {
        $push: {
          reviews: {
            userId,
            userName: user?.name || "Customer",
            rating: numericRating,
            comment: cleanComment,
            tags: Array.isArray(requestedTags) ? requestedTags : [],
            createdAt: review.createdAt
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ status: "fail", message: "Food item not found" });
    }

    const review = await Review.create({
      orderId,
      menuItem: updatedItem._id,
      userId,
      customerName: user?.name || "Customer",
      rating: numericRating,
      serviceExperience: experiences,
      comment: cleanComment
    });

    const updatedReviews = Array.isArray(updatedItem.reviews) ? updatedItem.reviews : [];
    const averageRating = updatedReviews.reduce(
      (total, item) => total + Number(item.rating || 0),
      0
    ) / updatedReviews.length;
    updatedItem.rating = Number(averageRating.toFixed(1));
    updatedItem.numReviews = updatedReviews.length;
    await updatedItem.save();

    await OrderModel.updateOne(
      { _id: order._id, "items._id": orderItem._id },
      { $set: { "items.$.isReviewed": true, updatedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Thank you for your feedback!",
      data: review
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ status: "fail", message: "This item has already been reviewed", alreadyReviewed: true });
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
