import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const SendEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.SMTP_KEY
        },
        family: 4 // IPv4 ফোর্সিংয়ের জন্য এটি খুবই জরুরি
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
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