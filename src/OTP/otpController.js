import { verifyOtpService } from "./otpService.js";

export const verifyOtpController = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {

            return res.status(400).json({
                status: "fail",
                message: "Email and OTP are required"
            });
        }

        const result = await verifyOtpService(
            email,
            otp
        );

        return res.status(
            Number(result.status) || 500
        ).json(result);

    } catch (error) {

        console.log("OTP Controller Error:", error);

        return res.status(500).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
};