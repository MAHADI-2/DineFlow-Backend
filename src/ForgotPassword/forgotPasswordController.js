import { forgotPasswordService, resetPasswordService } from "./forgotPasswordService.js";

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: "fail", message: "Email is required" });
        }

        const result = await forgotPasswordService(email);
        return res.status(Number(result.status) || 500).json(result);

    } catch (error) {
        return res.status(500).json({ status: "fail", message: "Something went wrong" });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ status: "fail", message: "Email, OTP and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ status: "fail", message: "Password must be at least 6 characters" });
        }

        const result = await resetPasswordService(email, otp, newPassword);
        return res.status(Number(result.status) || 500).json(result);

    } catch (error) {
        return res.status(500).json({ status: "fail", message: "Something went wrong" });
    }
};
