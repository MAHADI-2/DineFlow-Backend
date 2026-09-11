import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "./app.js";
import config from "./config.js";
import User from "./model/User.js";

const { port, MONGO_URL } = config;

const demoUsers = [
    {
        name: "System Admin",
        email: "admin@dineflow.com",
        password: "Admin123",
        role: "admin"
    },
    {
        name: "Demo Customer",
        email: "customer@dineflow.com",
        password: "123456",
        role: "customer"
    }
];

const seedDemoUsers = async () => {
    for (const demoUser of demoUsers) {
        const existingUser = await User.findOne({ email: demoUser.email });

        if (existingUser) {
            continue;
        }

        const password = await bcrypt.hash(demoUser.password, 10);

        await User.create({
            name: demoUser.name,
            email: demoUser.email,
            password,
            role: demoUser.role,
            isValid: true,
            isActive: true
        });

        console.log(`Created ${demoUser.role} demo account: ${demoUser.email}`);
    }
};

mongoose
    .connect(MONGO_URL)
    .then(async () => {
        console.log("Database connection successful");
        await seedDemoUsers();
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.log("Database connection failed");
        console.log(error);
    });