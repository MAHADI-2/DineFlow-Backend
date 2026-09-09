import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  // 1. User name
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true
  },

  // 2. User email
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email"
    ]
  },

  // 3. Password
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false
  },

  // 4. OTP
  // Register করার সময় এখানে OTP থাকবে
  otp: {
    type: Number,
    default: null
  },

  // 5. OTP কখন পর্যন্ত valid থাকবে
  otpExpires: {
    type: Date,
    default: null
  },

  // 6. User phone
  phone: {
    type: String,
    trim: true
  },
  // 7. User role
  role: {
    type: String,
    enum: ["customer", "admin", "delivery"],
    default: "customer"
  },

  profilePicture: { type: String, default: "" },

  // 8. User addresses
  addresses: [
    {
      name: String,
      street: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String
    }
  ],
  // 9. User active কিনা
  isActive: {
    type: Boolean,
    default: true
  },

  // 10. OTP verification হয়েছে কিনা
  // Register করার সময় false
  // OTP সঠিক দিলে true
  isValid: {
    type: Boolean,
    default: false
  },

  // 11. User create হওয়ার সময়
  createdAt: {
    type: Date,
    default: Date.now
  }

});


const User = mongoose.model("User", userSchema);

export default User;