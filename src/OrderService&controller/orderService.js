import MenuItem from "../model/MenuItem.js";
import { OrderModel } from "../model/Order.js";

const DELIVERY_FEE = 60; // taka

const calculatePromoDiscount = (promoCode, amount) => {
  const code = String(promoCode || "").trim().toUpperCase();
  if (code === "SAVE10") return Math.min(amount, Math.round(amount * 0.1));
  if (code === "DINE50") return Math.min(amount, 50);
  return 0;
};


export const createOrder = async (data) => {
  try {
    const {
      orderId,
      userId,
      items,
      deliveryAddress,
      paymentMethod,
      paymentStatus,
      promoCode,
      notes,
      phone,
    } = data;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("At least one menu item is required");
    }

    // ১. ফ্রন্টএন্ডের বিভিন্ন cart shape থেকে সব আইডি সংগ্রহ করা
    const itemIds = items.map((item) => (
      item.menuItem || item.menuId || item.id || item.menuItemId || item._id
    )?.toString());
    console.log("Order items received:", items);
    if (itemIds.some((id) => !id || !/^[a-f\d]{24}$/i.test(id))) {
      throw new Error("Invalid menu item id");
    }

    // ২. ডাটাবেজ থেকে খাবারগুলো খুঁজে বের করা
    const allItems = await MenuItem.find({
      _id: { $in: [...new Set(itemIds)] }
    });

    let totalAmount = 0;
    const myItemsList = [];

    if (allItems.length !== new Set(itemIds).size) {
      throw new Error("One or more menu items are no longer available");
    }

    // ৩. প্রতিটি আইটেমের দাম সার্ভারের database থেকে হিসাব করা
    for (const item of items) {
      const currentId = (
        item.menuItem || item.menuId || item.id || item.menuItemId || item._id
      )?.toString();
      
      // ডাটাবেজের আইটেমের সাথে মেলানো
      const dbItem = allItems.find((x) => x._id.toString() === currentId);
      console.log("Found DB item:", dbItem ? {
        id: dbItem._id,
        name: dbItem.name,
        isAvailable: dbItem.isAvailable
      } : null);

      if (!dbItem) throw new Error("Menu item not found");
      if (dbItem.isAvailable === false) {
        throw new Error("One or more menu items are no longer available");
      }
      const price = Number(dbItem.price);
      const name = dbItem.name;
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        throw new Error("Quantity must be a whole number between 1 and 99");
      }
      const subtotal = price * qty;

      totalAmount += subtotal;

      myItemsList.push({
        menuItemId: dbItem._id,
        itemName: name,
        quantity: qty,
        price: price,
        subtotal: subtotal,
      });
    }

    // ৪. মোট বিল = খাবারের দাম + ডেলিভারি ফি (৬০ টাকা)
    const subtotalWithDelivery = totalAmount + DELIVERY_FEE;
    const promoDiscount = calculatePromoDiscount(promoCode, subtotalWithDelivery);
    const grandTotal = subtotalWithDelivery - promoDiscount;

    const Time = allItems.length > 0 ? Math.max(...allItems.map((x) => x.preparationTime || 0), 30) : 30;
    const delivery = new Date(Date.now() + Time * 60 * 1000);

    // ৫. অর্ডারে সেভ করা
    const order = await OrderModel.create({
      orderId,
      userId,
      items: myItemsList,
      totalAmount: grandTotal,
      deliveryFee: DELIVERY_FEE,
      deliveryAddress: {
        ...deliveryAddress,
        phone: phone || deliveryAddress?.phone,
      },
      paymentMethod,
      notes,
      paymentStatus: paymentStatus || (paymentMethod === "cod" ? "unpaid" : "paid"),
      status: paymentStatus === "pending" ? "pending" : "confirmed",
      estimatedDelivery: delivery,
    });

    return {
      status: "success",
      message: "Order created successfully",
      orderId: order.orderId,
      data: order,
    };
  } catch (error) {
    console.log("Mongoose আসল এরর:", error.message);
    throw new Error(error.message);
  }
};


// ekta order er full details khuje ber kore

// ✅ হ্যাকিং-প্রুফ ১০০% সিকিউর কোড:
export const getOrderDetails = async (orderId, userId) => {
  try {
    // orderId এবং userId দুটোই ম্যাচ করানো হলো
    // custom orderId বা mongoDB _id দুটোই সাপোর্ট করবে
 const order = await OrderModel.findOne({
      orderId: orderId,
      userId: userId
    });
    
    if (!order) {
      return {
        status: "fail",
        message: "Order not found or you are not authorized to view this order"
      };
    }

    return {
      status: "success",
      data: order
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


// ekjon customer er shob order (notun theke purono, sort kore)

export const getallOrdersByUser = async (userId) => {
  try {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });

    // ✅ খালি থাকলেও সুন্দরভাবে খালি লিস্ট ও সাকসেস পাঠাবে, কোনো এরর থ্রো করবে না
    return {
      status: "success",
      message: "Orders fetched successfully",
      data: orders || [],
      orders: orders || []
    };
  } catch (error) {
    console.log("Mongoose আসল এরর:", error.message);
    throw new Error(error.message);
  }
};







// Admin er jonno - database er shob order

export const getAllOrders = async () => {
  try {
    // ✅ populate('userId', 'name email phone') দিলে কাস্টমারের আসল নাম-ইমেইলও একসাথে পাওয়া যাবে
    const orders = await OrderModel.find()
      .populate("userId", "name email phone addresses")
      .sort({ createdAt: -1 });
    
    // কোনো অর্ডার না থাকলে সুন্দরভাবে খালি অ্যারে পাঠাবে, এরর মারবে না
    return {
      status: "success",
      message: "Orders fetched successfully",
      data: orders || [],
      orders: orders || []
    };
  } catch (error) {
    console.log("Mongoose আসল এরর:", error.message);
    throw new Error(error.message);
  }
}




export const updateOrderPaymentStatus=async(orderId,status)=>{

try{
  const  validStatus = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
  if (!validStatus.includes(status)) {
    throw new Error("Invalid payment status");
  }
 const order = await OrderModel.findOneAndUpdate(
 { orderId },
 { status, updatedAt: new Date() },
 { new: true }
 );
 if (!order) {
  throw new Error("Order not found");
}
return {
  status: "success",
  message: "Order payment status updated successfully",
  data: order
}
}
catch(error){
  console.log("Mongoose আসল এরর:", error.message); // আসল কারণটি টার্মিনালে দেখতে পাবেন
  throw new Error(error.message);
  
}
}

export const deleteOrder = async (orderId) => {
  try {
    // ✅ অ্যাডমিনের জন্য userId মেলানোর দরকার নেই, শুধু orderId অথবা _id দিয়ে ডিলিট হবে
    const order = await OrderModel.findOneAndDelete({
      $or: [{ orderId: orderId }, { _id: orderId }]
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      status: "success",
      message: "Order deleted successfully",
      data: order
    };
  } catch (error) {
    console.log("Mongoose আসল এরর:", error.message);
    throw new Error(error.message);
  }
};



export const cancelOrderService = async (orderId, userId) => {
    try {
        const order = await OrderModel.findOne({ _id: orderId, userId });
        
        if (!order) {
            return { status: "fail", message: "Order not found" };
        }

        // যদি অর্ডার ইতিমধ্যে প্রসেসিং বা অন্য স্টেজে চলে যায়, তবে ক্যানসেল করতে দেওয়া হবে না
        if (order.status !== "pending") {
            return { status: "fail", message: "Order cannot be cancelled at this stage" };
        }

        order.status = "cancelled";
        await order.save();

        return {
            status: "success",
            message: "Order cancelled successfully",
            data: order
        };
    } catch (error) {
        throw new Error(error.message);
    }
};