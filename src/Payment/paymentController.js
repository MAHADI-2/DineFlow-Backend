import { createOrder } from "../OrderService&controller/orderService.js";
import { initiatePaymentService, validatePaymentService } from "./paymentService.js";
import { OrderModel } from "../model/Order.js";
import config from "../config.js";

const productionClientUrl = "https://dine-flow-frontend-blond.vercel.app";
const configuredClientUrl = (config.CLIENT_URL || "").trim().replace(/\/+$/, "");
const clientUrl = configuredClientUrl && !/localhost|127\.0\.0\.1/i.test(configuredClientUrl)
    ? configuredClientUrl
    : productionClientUrl;

const normalizeValue = (value) => String(value ?? "").trim();
const isValidGatewayStatus = (status) => ["VALID", "VALIDATED"].includes(normalizeValue(status).toUpperCase());
const successRedirect = (orderId, transactionId) =>
    `${clientUrl}/order/success/${orderId}?payment=success&tran_id=${encodeURIComponent(transactionId || orderId)}`;


export const initiatePaymentController = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        if (!userId) {
            return res.status(400).json({ status: "fail", message: "User ID is missing in headers" });
        }
        
        const { paymentMethod, items, deliveryAddress, totalAmount, promoCode } = req.body;
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // যদি ক্যাশ অন ডেলিভারি হয়
        if (paymentMethod === "cod") {
            const orderResult = await createOrder({
                items,
                deliveryAddress,
                totalAmount,
                orderId,
                userId,
                paymentMethod: "cod",
                paymentStatus: "unpaid", // ক্যাশ অন ডেলিভারিতে পেমেন্ট পরে হবে
                status: "confirmed"     // অর্ডার সরাসরি কনফার্ম হয়ে যাবে
            });

            return res.status(200).json({
                status: "success",
                message: "Order placed successfully with Cash on Delivery",
                orderId
            });
        }

        // অন্যথায় এসএসএল কমার্জ (SSLCommerz) পেমেন্ট প্রসেস হবে
        const orderResult = await createOrder({
            items,
            deliveryAddress,
            totalAmount,
            orderId,
            userId,
            paymentMethod: "sslcommerz",
            paymentStatus: "pending",
            promoCode
        });

        const session = await initiatePaymentService(orderResult.data);
        if (session.status !== "success" || !session.url) {
            return res.status(502).json({
                status: "fail",
                message: session.message || "Failed to initiate payment session"
            });
        }
        return res.status(200).json({
            status: "success",
            message: "Redirect to payment gateway",
            url: session.url,
            orderId
        });

    } catch (error) {
        const clientInputErrors = [
            "At least one menu item is required",
            "Invalid menu item id",
            "One or more menu items are no longer available",
            "Menu item not found",
            "Quantity must be a whole number between 1 and 99"
        ];
        const isClientInputError = clientInputErrors.includes(error.message)
            || error.message.endsWith("is currently out of stock");
        return res.status(isClientInputError ? 400 : 500).json({
            status: "fail",
            message: error.message || "Payment initialization failed"
        });
    }
}

// SSLCommerz payment success hole EI URL e POST request pathay
// (GET na, POST - form data hisebe val_id, tran_id ashe)



export const paymentSuccessController = async (req, res) => {


try {
    
const { orderId } = req.params;
 const { val_id, tran_id } = { ...req.query, ...req.body };
 const callbackTransactionId = normalizeValue(tran_id);
 const validationId = normalizeValue(val_id);
 const order = await OrderModel.findOne({ orderId });
 if (!order || (callbackTransactionId && callbackTransactionId !== normalizeValue(order.orderId))) {
 return res.redirect(`${clientUrl}/order/fail/${orderId}?payment=failed`);
 }
 if (order.paymentStatus === "paid") {
     return res.redirect(successRedirect(orderId, order.transactionId || callbackTransactionId));
 }
 if (order.paymentStatus !== "pending" || !validationId) {
     return res.redirect(`${clientUrl}/order/fail/${orderId}?payment=failed`);
 }

const validation = await validatePaymentService(validationId);
const validatedAmount = Number(validation.amount);
const validatedTransactionId = normalizeValue(validation.tran_id);
const validatedCurrency = normalizeValue(validation.currency || validation.currency_type).toUpperCase();
const isValidPayment =
 isValidGatewayStatus(validation.status) &&
 (!validatedTransactionId || validatedTransactionId === normalizeValue(order.orderId)) &&
 Number.isFinite(validatedAmount) &&
 Math.abs(validatedAmount - Number(order.totalAmount)) < 0.01 &&
 (!validatedCurrency || validatedCurrency === "BDT");
if (!isValidPayment) {
 console.error("SSLCommerz validation rejected:", {
     orderId,
     status: validation.status,
     callbackTransactionId,
     validatedTransactionId,
     validatedAmount,
     expectedAmount: Number(order.totalAmount),
     validatedCurrency,
     hasValidationId: Boolean(validationId)
 });
 await OrderModel.findOneAndUpdate(
 { orderId, paymentStatus: "pending" },
 { paymentStatus: "failed", status: "cancelled" }
 );
return res.redirect(`${clientUrl}/order/fail/${orderId}?payment=failed`);
}
 const updatedOrder = await OrderModel.findOneAndUpdate(
 { orderId, paymentStatus: "pending" },
 {
 paymentStatus: "paid",
 status: "confirmed",
 transactionId: validation.tran_id || tran_id,
 validationId,
 updatedAt: new Date()
 },
 { new: true }
 );
 if (!updatedOrder) {
     const currentOrder = await OrderModel.findOne({ orderId });
     if (currentOrder?.paymentStatus === "paid") {
         return res.redirect(successRedirect(orderId, currentOrder.transactionId || callbackTransactionId));
     }
     return res.redirect(`${clientUrl}/order/fail/${orderId}?payment=failed`);
 }
 // ফ্রন্টএন্ডের নিজের সাকসেস পেজে রিডাইরেক্ট, যাতে ডিজাইন consistent থাকে
 return res.redirect(successRedirect(orderId, validatedTransactionId || callbackTransactionId));
 } catch (error) {
 console.log("Payment success error:", error.message);
 return res.redirect(`${clientUrl}/order/fail/${orderId}?payment=failed`);
 }

}


export const paymentFailController = async (req, res) => {
 const { orderId } = req.params;
 await OrderModel.findOneAndUpdate(
 { orderId, paymentStatus: "pending" },
 { paymentStatus: "failed", status: "cancelled" }
 );
 return res.redirect(`${clientUrl}/order/fail/${orderId}?payment=failed`);
};
export const paymentCancelController = async (req, res) => {
 const { orderId } = req.params;
 await OrderModel.findOneAndUpdate(
 { orderId, paymentStatus: "pending" },
 { paymentStatus: "failed", status: "cancelled" }
 );
 return res.redirect(`${clientUrl}/order/cancel/${orderId}?payment=cancelled`);
};





export const ipnController = async (req, res) => {
 try {
 const { tran_id, val_id, status } = req.body;
 const callbackTransactionId = normalizeValue(tran_id);
 const validationId = normalizeValue(val_id);
 const validation = validationId ? await validatePaymentService(validationId) : null;
 const order = await OrderModel.findOne({ orderId: callbackTransactionId, paymentStatus: "pending" });
 const validatedTransactionId = normalizeValue(validation?.tran_id);
 const validatedCurrency = normalizeValue(validation?.currency || validation?.currency_type).toUpperCase();
 const isValidPayment = validation &&
  isValidGatewayStatus(status) &&
  isValidGatewayStatus(validation.status) &&
  validatedTransactionId === callbackTransactionId &&
  Number.isFinite(Number(validation.amount)) &&
  Math.abs(Number(validation.amount) - Number(order?.totalAmount)) < 0.01 &&
  (!validatedCurrency || validatedCurrency === "BDT");
 if (isValidPayment && order) {
 await OrderModel.findOneAndUpdate(
 { orderId: callbackTransactionId, paymentStatus: "pending" },
 { paymentStatus: "paid", status: "confirmed", transactionId: validatedTransactionId, validationId }
 );
 }
 return res.status(200).send("IPN received");
 } catch (error) {
 console.log("IPN error:", error.message);
 return res.status(500).send("IPN error");
 }
};


