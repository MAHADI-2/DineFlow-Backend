import User from "../model/User.js";

export const getProfileService = async (userId) => {
    const user = await User.findById(userId).select("-password -otp -otpExpires").lean();

    if (!user) {
        return { status: "fail", message: "User not found" };
    }

    return { status: "success", user };
};

export const updateProfileService = async (userId, { name, phone, address }) => {

    try {

        const user = await User.findById(userId);

        if (!user) {
            return {
                status: "fail",
                message: "User not found"
            };
        }

        // নাম আপডেট (দিলে)
        if (name) {
            user.name = name;
        }

        // ফোন নাম্বার আপডেট (দিলে) — টপ-লেভেল ফিল্ড
        if (phone) {
            user.phone = phone;
        }

        // ঠিকানা আপডেট (দিলে) — addresses array এর প্রথমটা আপডেট/তৈরি করা
        if (address) {
            if (user.addresses && user.addresses.length > 0) {
                user.addresses[0].street = address;
                if (phone) {
                    user.addresses[0].phone = phone;
                }
            } else {
                user.addresses = [{ street: address, phone: phone || "" }];
            }
        }

        await user.save();

        return {
            status: "success",
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                addresses: user.addresses,
                profilePicture: user.profilePicture
            }
        };

    } catch (error) {

        return {
            status: "fail",
            message: error.message
        };
    }
};