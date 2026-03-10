import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const CITIES = [
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Hyderabad, India",
    "Chennai, India",
    "Kolkata, India",
    "Pune, India",
    "Ahmedabad, India"
];

function getRandomCity() {
    return CITIES[Math.floor(Math.random() * CITIES.length)];
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for location seeding...");

        const products = await Product.find({});
        console.log(`Found ${products.length} existing products.`);

        let updatedCount = 0;
        for (const p of products) {
            if (!p.origin_location || p.origin_location === "Mumbai, India") {
                p.origin_location = getRandomCity();
                await p.save();
                updatedCount++;
            }
        }

        console.log(`Successfully assigned random origin locations to ${updatedCount} products!`);
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

run();
