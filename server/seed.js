import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const sampleProducts = [
    {
        product_name: "Wireless Headphones",
        product_description: "High-quality noise-cancelling wireless headphones with 20-hour battery life.",
        product_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        category: "Electronics",
        price: 199.99,
        rating: { rate: 4.5, count: 120 },
    },
    {
        product_name: "Smart Watch",
        product_description: "Track your fitness, heart rate, and notifications on the go.",
        product_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
        category: "Wearables",
        price: 149.5,
        rating: { rate: 4.2, count: 89 },
    },
    {
        product_name: "Running Shoes",
        product_description: "Lightweight, durable running shoes for all terrains.",
        product_image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
        category: "Footwear",
        price: 89.99,
        rating: { rate: 4.7, count: 210 },
    },
    {
        product_name: "Leather Backpack",
        product_description: "Stylish and spacious leather backpack for daily commute.",
        product_image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
        category: "Accessories",
        price: 120.0,
        rating: { rate: 4.3, count: 65 },
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        await Product.deleteMany({});
        console.log("Cleared existing products");

        const inserted = await Product.insertMany(sampleProducts);
        console.log(`Seeded ${inserted.length} products`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err.message);
        process.exit(1);
    }
}

seed();
