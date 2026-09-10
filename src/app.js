import express from 'express';
import cors from 'cors';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './api.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(currentDir, '../uploads');

const app = express();

// সিকিউরিটি মিডলওয়্যার
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// বডি পার্সার লিমিট বাড়িয়ে দেওয়া
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// আপলোড ফোল্ডার স্ট্যাটিক করা
app.use("/uploads", express.static(uploadDir));

// CORS কনফিগারেশন
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173,http://localhost:3000")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
        const allowedOrigins = [...new Set([
            ...configuredOrigins,
            "https://dine-flow-frontend-blond.vercel.app"
        ])];

        let isSslCommerzOrigin = false;
        try {
            const hostname = new URL(origin).hostname.toLowerCase();
            isSslCommerzOrigin = hostname === "sslcommerz.com" || hostname.endsWith(".sslcommerz.com");
        } catch {
            isSslCommerzOrigin = false;
        }

        if (allowedOrigins.includes(origin) || isSslCommerzOrigin) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true
}));

// রেট লিমিটার
const limiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// মেইন রাউট
app.use("/api/v1", router);

export default app;