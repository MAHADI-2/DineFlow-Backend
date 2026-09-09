import User from "../model/User.js";

export const updateProfilePic = async (userId, imageUrl) => {

    try {

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePicture: imageUrl
            },
            {
                new: true
            }
        );

        if (!updatedUser) {
            return {
                status: "fail",
                message: "User not found"
            };
        }

        return {
            status: "success",
            message: "Profile Pic Updated Successfully",
            user: updatedUser
        };

    } catch (error) {

        return {
            status: "fail",
            message: error.message
        };

    }
};