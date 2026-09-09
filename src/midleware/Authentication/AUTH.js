import { verifyToken } from "../../token/token.js";
import User from "../../model/User.js";

export const AUTH = async (req, res, next) => {
    try {
        // ১. সঠিকভাবে হেডার থেকে টোকেন সংগ্রহ করা
        let token = req.headers.authorization || req.headers.token;

        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "No token provided, authorization denied"
            });
        }

        // যদি টোকেনের সাথে 'Bearer ' যুক্ত থাকে তা রিমুভ করা
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const decode = verifyToken(token);

        if (!decode?.id) {
            return res.status(401).json({ status: "fail", message: "Invalid token" });
        }

        const { email, id, role } = decode;
        req.user = { id, email, role };
        
        req.headers.email = email;
        req.headers.user_id = id; // id-কে user_id এ অ্যাসাইন করা হলো
        req.headers.role = role;


        // ৩. সঠিকভাবে next() ফাংশন কল করা
        return next();

    } catch (error) {
        return res.status(401).json({
            status: "fail",
            message: "Invalid or expired token"
        });
    }
};


export const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.headers.user_id;
        const currentUser = await User.findById(userId).select("role isActive").lean();
        const userRole = currentUser?.role;

        if (currentUser?.isActive === false) {
            return res.status(403).json({ status: "fail", message: "Account is inactive" });
        }

        if (userRole === "admin") {
            req.user.role = userRole;
            req.headers.role = userRole;
            return next();
        }

        return res.status(403).json({
            status: "fail",
            message: "Access denied. Admin only."
        });
    } catch (error) {
        return res.status(401).json({
            status: "fail",
            message: "Unable to verify account permissions"
        });
    }
};