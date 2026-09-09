import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { SendEmail } from "../Email/sendEmail.js";

// ধাপ ১: ইমেইল দিয়ে OTP পাঠানো
export const forgotPasswordService = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            // security: user na thakleo shothik message dekhano hoy na, jate email exist kore kina bujha na jay
            return {
                status: "200",
                message: "If this email is registered, an OTP has been sent."
            };
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await User.findByIdAndUpdate(user._id, {
            otp: otp,
            otpExpires: otpExpires
        });

        const subject = "Password Reset OTP";
        const text = `Your password reset OTP is ${otp}. This code will expire in 10 minutes. If you didn't request this, please ignore this email.`;

        await SendEmail(email, subject, text);

        return {
            status: "200",
            message: "If this email is registered, an OTP has been sent."
        };

    } catch (error) {
        console.log("Forgot Password Error:", error);
        return {
            status: "500",
            message: "Something went wrong"
        };
    }
};

// ধাপ ২: OTP verify kore notun password set kora
export const resetPasswordService = async (email, otp, newPassword) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return {
                status: "404",
                message: "Invalid request"
            };
        }

        if (String(user.otp) !== String(otp)) {
            return {
                status: "400",
                message: "Invalid OTP"
            };
        }

        if (!user.otpExpires || new Date() > new Date(user.otpExpires)) {
            return {
                status: "400",
                message: "OTP has expired. Please request a new one."
            };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            otp: null,
            otpExpires: null
        });

        return {
            status: "200",
            message: "Password reset successfully. Please login with your new password."
        };

    } catch (error) {
        console.log("Reset Password Error:", error);
        return {
            status: "500",
            message: "Something went wrong"
        };
    }
};
