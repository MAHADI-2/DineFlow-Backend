import User from "../model/User.js";
import { SendEmail } from "../Email/sendEmail.js";
import bcrypt from "bcryptjs";

export const CreateUser = async (name, email, password, addresses) => {
    try {

        // আগে দেখি এই email দিয়ে user আছে কিনা
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return {
                status: "400",
                message: "User already exists"
            };
        }

        // OTP তৈরি
        const otp = Math.floor(100000 + Math.random() * 900000);
        // OTP ১০ মিনিট পর্যন্ত ভ্যালিড থাকবে
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Email এ OTP পাঠানো
        const subject = "OTP Verification";
        const text = `Your OTP is ${otp}. This code will expire in 10 minutes.`;

        await SendEmail(email, subject, text);

        // Password hash
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        // User তৈরি
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            otp: otp,
            otpExpires: otpExpires,
            addresses: addresses,
            role: "customer",
            isValid: false
        });

        return {
            status: "201",
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };

    } catch (error) {

        console.log("Register Error:", error);

        return {
            status: "500",
            message: "Something went wrong"
        };
    }
};


