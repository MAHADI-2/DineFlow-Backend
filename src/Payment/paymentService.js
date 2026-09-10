import SSLCommerzPayment from "sslcommerz-lts";
import config from "../config.js";

const store_id = config.SSL_STORE_ID;
const store_passwd = config.SSL_STORE_PASSWORD;
const is_live = config.SSL_IS_LIVE;

export const initiatePaymentService = async (order) => {
  try {
    const data = {
      total_amount: order.totalAmount,
      currency: "BDT",
      tran_id: order.orderId,
      success_url: `${config.SERVER_URL}/api/v1/payment/success/${order.orderId}`,
      fail_url: `${config.SERVER_URL}/api/v1/payment/fail/${order.orderId}`,
      cancel_url: `${config.SERVER_URL}/api/v1/payment/cancel/${order.orderId}`,
      ipn_url: `${config.SERVER_URL}/api/v1/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Food Order",
      product_category: "Food",
      product_profile: "general",
      cus_name: order.deliveryAddress?.name || "Customer",
      cus_email: order.customerEmail || "customer@example.com",
      cus_add1: order.deliveryAddress?.street || "N/A",
      cus_city: order.deliveryAddress?.city || "Dhaka",
      cus_postcode: order.deliveryAddress?.postalCode || "1200",
      cus_country: order.deliveryAddress?.country || "Bangladesh",
      cus_phone: order.deliveryAddress?.phone || "01700000000",
      ship_name: order.deliveryAddress?.name || "Customer",
      ship_add1: order.deliveryAddress?.street || "N/A",
      ship_city: order.deliveryAddress?.city || "Dhaka",
      ship_postcode: order.deliveryAddress?.postalCode || "1200",
      ship_country: "Bangladesh"
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const session = await sslcz.init(data);

    if (session?.GatewayPageURL) {
      return {
        status: "success",
        message: "Payment session initiated successfully",
        url: session.GatewayPageURL
      };
    }

    return {
      status: "fail",
      message: "Failed to initiate payment session",
      data: session
    };
  } catch (error) {
    console.error("SSLCommerz session error:", error.message);
    throw new Error("Failed to initiate payment session");
  }
};

export const validatePaymentService = async (val_id) => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  return sslcz.validate({ val_id });
};
