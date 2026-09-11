import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const SendEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", result);
        return { sent: true };
    } catch (error) {
        console.error("Email delivery failed:", error.message);
        return { sent: false, error };
    }
};