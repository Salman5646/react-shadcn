import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ── Routes ──

// GET all products
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single product by ID
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a new product
app.post("/api/products", async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a product
app.put("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// ── User Routes ──

// POST register a new user
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, phone, address, city, country } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name, email, password: hashedPassword,
            phone, address, city, country,
        });

        res.status(201).json({
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                city: user.city,
                country: user.country,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST login a user
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                city: user.city,
                country: user.country,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST Google OAuth login
app.post("/api/google-auth", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        // Verify the Google token
        const { OAuth2Client } = await import("google-auth-library");
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find existing user or create a new one
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // If user registered with email/password (has password, no googleId), reject Google login
            if (user.password && !user.googleId) {
                return res.status(400).json({
                    message: "This email is already registered. Please login with your email and password."
                });
            }
        } else {
            // Create new user from Google profile
            user = await User.create({
                name,
                email,
                googleId,
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                city: user.city,
                country: user.country,
            },
        });
    } catch (err) {
        console.error("Google auth error:", err.message);
        res.status(401).json({ message: "Invalid Google token" });
    }
});

// PUT update user profile (for Google users completing their profile)
app.put("/api/update-profile", async (req, res) => {
    try {
        const { userId, phone, address, city, country } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { phone, address, city, country },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                city: user.city,
                country: user.country,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Admin Routes ──

// GET all users (admin only)
app.get("/api/admin/users", async (req, res) => {
    try {
        const adminId = req.headers["x-admin-id"];
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const admin = await User.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a user (admin only)
app.delete("/api/admin/users/:id", async (req, res) => {
    try {
        const adminId = req.headers["x-admin-id"];
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const admin = await User.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        if (req.params.id === adminId) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update user role (admin only)
app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
        const adminId = req.headers["x-admin-id"];
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const admin = await User.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Role updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Connect to MongoDB & Start ──
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });
