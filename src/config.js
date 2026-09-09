import dotenv from "dotenv";
dotenv.config();
const config = {
    port: process.env.PORT || 3000,
    MONGO_URL: process.env.MONGO_URL,
    SECRET_PASS: process.env.SECRET_PASS,
    BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
    SMTP_PORT: process.env.SMTP_PORT,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    SMTP_KEY: process.env.SMTP_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,


//  kora holo

 SSL_STORE_ID: process.env.SSL_STORE_ID,
 SSL_STORE_PASSWORD: process.env.SSL_STORE_PASSWORD,
 SSL_IS_LIVE: process.env.SSL_IS_LIVE === "true",
 SERVER_URL: process.env.SERVER_URL,
 CLIENT_URL: process.env.CLIENT_URL,
 CORS_ORIGINS: process.env.CORS_ORIGINS || process.env.CLIENT_URL



}
export default config;
