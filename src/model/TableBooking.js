import mongoose from "mongoose";

const tableBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  time: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  occasion: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ""
  },
  seatingArea: {
    type: String,
    trim: true,
    maxlength: 60,
    default: "Main dining room"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "seated", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

tableBookingSchema.index({ date: 1, time: 1, status: 1 });

export const TableBookingModel = mongoose.model("TableBooking", tableBookingSchema);
