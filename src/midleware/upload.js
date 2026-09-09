import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(currentDir, "../../uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed"));
        }
        return cb(null, true);
    }
})

export default upload