import { CreateUser } from "./userService.js";

export const registerController = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            addresses
        } = req.body;

        // Required field check
        if (!name || !email || !password) {

            return res.status(400).json({
                status: "fail",
                message: "Please provide name, email and password"
            });
        }

        const result = await CreateUser(
            name,
            email,
            password,
            addresses
        );

        return res.status(
            Number(result.status) || 500
        ).json(result);

    } catch (error) {

        console.log("Register Controller Error:", error);

        return res.status(500).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
};