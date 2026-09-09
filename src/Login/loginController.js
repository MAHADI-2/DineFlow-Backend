import { loginService } from "./loginService.js";

export const loginController = async (req, res) => {

    try {

        const result = await loginService(req.body);

        return res.status(
            Number(result.status) || 500
        ).json(result);

    } catch (error) {

        console.log("Login Controller Error:", error);

        return res.status(500).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
};