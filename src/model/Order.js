import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItemId: mongoose.Schema.Types.ObjectId,
    itemName: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
 totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 60
  },
  deliveryAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  shippingAddress:{
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
paymentMethod: {
 type: String,
 enum: ['cash', 'cod', 'card', 'online', 'sslcommerz'],
 required: true
},
paymentStatus: {
 type: String,
 enum: ['unpaid', 'paid', 'failed', 'pending'],
 default: 'unpaid'
},
transactionId: String,
validationId: String,
  notes: String,
  estimatedDelivery: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const OrderModel = mongoose.model('Order', orderSchema);

