import mongoose from "mongoose";
import app from "./app.js";
import config from "./config.js";

const { port, MONGO_URL } = config;



mongoose
    .connect(MONGO_URL)
    .then(() => {
        console.log("Database connection successful");
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.log("Database connection failed");
        console.log(error);
    });