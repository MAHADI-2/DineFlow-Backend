import { getProfileService, updateProfileService } from "./updateProfileService.js";

export const getProfileController = async (req, res) => {
    try {
        const result = await getProfileService(req.headers.user_id);
        return res.status(result.status === "success" ? 200 : 404).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

export const updateProfileController = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        const { name, phone, address } = req.body;

        const result = await updateProfileService(userId, { name, phone, address });

        return res.status(
            result.status === "success" ? 200 : 400
        ).json(result);

    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};