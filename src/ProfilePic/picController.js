import { updateProfilePic } from "./PicService.js";

export const updateProfilePicController = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                status: "fail",
                message: "Please select an image"
            });
        }

        const userId = req.headers.user_id;

        const imagePath = req.file.path;

        const result = await updateProfilePic(userId, imagePath);

        if (result.status === "fail") {
            return res.status(404).json(result);
        }

        return res.status(200).json({
            ...result,
            user: result.user?.toObject ? result.user.toObject() : result.user
        });

    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};