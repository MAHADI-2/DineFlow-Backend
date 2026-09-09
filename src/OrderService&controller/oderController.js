import { createOrder, getOrderDetails, getallOrdersByUser, getAllOrders, updateOrderPaymentStatus,deleteOrder, cancelOrderService } from "./orderService.js";
import { OrderModel } from "../model/Order.js";

import {initiatePaymentController} from "../Payment/paymentController.js";

export const createOrderController = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        if (!userId) {
            return res.status(400).json({ status: "fail", message: "User ID is missing in headers" });
        }
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const result = await createOrder({ ...req.body, orderId, userId });
        return res.status(201).json(result);
    } catch (error) {
      const isClientInputError = [
        "At least one menu item is required",
        "Invalid menu item id",
        "One or more menu items are no longer available",
        "Menu item not found",
        "Quantity must be a whole number between 1 and 99"
      ].includes(error.message);
      res.status(isClientInputError ? 400 : 500).json({
        status: "fail",
        message: error.message || "Something went wrong"
      });
    }
};


export const placeOrderController = async (req, res) => {
 const { paymentMethod } = req.body;
 if (paymentMethod === "cash" || paymentMethod === "cod") {
   // COD: order create hobe, paymentStatus="unpaid" thakbe
   return createOrderController(req, res);
 }
 // Online payment (sslcommerz/card/online)
 return initiatePaymentController(req, res);
}



export const markAsPaidController = async (req, res) => {
 try {
 const { orderId } = req.params;
 const order = await OrderModel.findOneAndUpdate(
 { orderId },
 {
 paymentStatus: "paid",
 status: "delivered",
 updatedAt: new Date()
 },
 { new: true }
 );
 if (!order) {
 return res.status(404).json({ status: "fail", message: "Order not found" });
 }
 return res.status(200).json({
 status: "success",
 message: "Payment received - order marked as paid",
 data: order
 });
 } catch (error) {
 return res.status(500).json({ status: "fail", message: error.message });
 }
};






export const getOrderDetailsController = async (req, res) => {
  try {
    const { orderId } = req.params;          // ✅ URL theke orderId
    const userId = req.headers.user_id;       // ✅ AUTH middleware theke asha userId

    const result = await getOrderDetails(orderId, userId);

    if (result.status === "fail") {
      return res.status(403).json(result); // 403 Forbidden
    }

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const getAllOrdersByUserController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    if (!userId) {
      return res.status(400).json({ status: "fail", message: "User ID is missing in headers" });
    }
    const result = await getallOrdersByUser(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message || "Something went wrong" });
  }
};




export const deleteOrderController = async (req, res) => {
    try {
        const { orderId } = req.params;
        // ✅ অ্যাডমিনের জন্য সরাসরি orderId পাঠানো হলো
        const result = await deleteOrder(orderId);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.message === "Order not found" ? 404 : 500;
        return res.status(statusCode).json({ 
            status: "fail", 
            message: error.message || "Something went wrong" 
        });
    }
};




export const getAllOrdersController = async (req, res) => {
    try {
        const result = await getAllOrders();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message || "Something went wrong" });
    }
};


export const updateOrderPaymentStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const result = await updateOrderPaymentStatus(orderId, status);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message || "Something went wrong" });
    }
};



export const cancelOrderController = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        const { orderId } = req.params;

        const result = await cancelOrderService(orderId, userId);

        if (result.status === "fail") {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};