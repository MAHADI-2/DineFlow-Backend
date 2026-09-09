import User from "../model/User.js";

export const verifyOtpService = async (email, otp) => {

    try {

        // Email দিয়ে user খুঁজবো
        const user = await User.findOne({ email });

        if (!user) {
            return {
                status: "404",
                message: "User not found"
            };
        }

        // OTP মিলাচ্ছি
        if (String(user.otp) !== String(otp)) {

            return {
                status: "400",
                message: "Invalid OTP"
            };
        }

        // OTP এর মেয়াদ শেষ হয়েছে কিনা চেক করা
        if (!user.otpExpires || new Date() > new Date(user.otpExpires)) {

            return {
                status: "400",
                message: "OTP has expired. Please request a new one."
            };
        }

        // OTP ঠিক
        await User.findByIdAndUpdate(
            user._id,
            {
                otp: null,
                otpExpires: null,
                isValid: true
            }
        );

        return {
            status: "200",
            message: "OTP verified successfully"
        };

    } catch (error) {

        console.log("OTP Error:", error);

        return {
            status: "500",
            message: "Something went wrong"
        };
    }
};