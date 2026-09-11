import mongoose from "mongoose";
import { TableBookingModel } from "../model/TableBooking.js";

const allowedStatuses = ["pending", "confirmed", "seated", "cancelled"];

export const createTableBookingController = async (req, res) => {
  try {
    const { name, phone, date, time, guests, occasion = "", seatingArea = "Main dining room" } = req.body;
    const guestCount = Number(guests);

    if (!name?.trim() || !phone?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !/^\d{2}:\d{2}$/.test(time || "")) {
      return res.status(400).json({ status: "fail", message: "Name, phone, date, and time are required" });
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      return res.status(400).json({ status: "fail", message: "Guests must be a whole number between 1 and 20" });
    }

    const requestedDate = new Date(`${date}T${time}:00`);
    if (Number.isNaN(requestedDate.getTime()) || requestedDate < new Date()) {
      return res.status(400).json({ status: "fail", message: "Please choose a future date and time" });
    }

    const booking = await TableBookingModel.create({
      userId: req.user.id,
      name: name.trim(),
      phone: phone.trim(),
      date,
      time,
      guests: guestCount,
      occasion: String(occasion).trim(),
      seatingArea: String(seatingArea).trim() || "Main dining room"
    });

    return res.status(201).json({ status: "success", message: "Table booking request received", data: booking });
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message || "Unable to create table booking" });
  }
};

export const getMyTableBookingsController = async (req, res) => {
  try {
    const bookings = await TableBookingModel.find({ userId: req.user.id })
      .sort({ date: 1, time: 1, createdAt: -1 })
      .lean();
    return res.status(200).json({ status: "success", data: bookings });
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message || "Unable to load your table bookings" });
  }
};

export const getAllTableBookingsController = async (req, res) => {
  try {
    const bookings = await TableBookingModel.find()
      .populate("userId", "name email phone")
      .sort({ date: 1, time: 1, createdAt: -1 })
      .lean();
    return res.status(200).json({ status: "success", data: bookings });
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message || "Unable to load table bookings" });
  }
};

export const updateTableBookingController = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ status: "fail", message: "Invalid booking ID" });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ status: "fail", message: "Invalid booking status" });
    }

    const booking = await TableBookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ status: "fail", message: "Table booking not found" });
    }
    return res.status(200).json({ status: "success", data: booking });
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message || "Unable to update table booking" });
  }
};
