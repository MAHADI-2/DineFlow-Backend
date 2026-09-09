import jwt from "jsonwebtoken";
import config from "../config.js";
const { SECRET_PASS } = config;
export const generateToken = ( user) => {
    const payload={
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
    }

    const token = jwt.sign(payload, SECRET_PASS, { expiresIn: config.JWT_EXPIRES_IN || "1d" });
    return token
}


export const verifyToken = (token) => {
    return jwt.verify(token,SECRET_PASS);
}

