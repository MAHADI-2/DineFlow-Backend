
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../token/token.js";

export const loginService = async (reqBody) => {

    try {

        const {
            email,
            password
        } = reqBody;

        // Email দিয়ে user খুঁজবো
        const user = await User
            .findOne({ email })
            .select("+password");

        if (!user) {

            return {
                status: "404",
                message: "User not found"
            };
        }

        // OTP verify করেছে কিনা
        if (user.isValid !== true) {

            return {
                status: "403",
                message: "Please verify OTP first"
            };
        }

        // Password check
        const comparePass = await bcrypt.compare(
            password,
            user.password
        );

        if (!comparePass) {

            return {
                status: "401",
                message: "Not Match Your Password"
            };
        }

        // Login সফল
        // এখন Token তৈরি হবে
        const token = generateToken(user);

        return {

            status: "200",

            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                addresses: user.addresses
            }
        };

    } catch (error) {

        console.log("Login Error:", error);

        return {
            status: "500",
            message: "Something went wrong"
        };
    }
};