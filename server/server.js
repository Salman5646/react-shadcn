import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Cart from "./models/Cart.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || "default-dev-secret-change-in-production";

// ── Cookie Signing Helpers ──
function signUserData(userData) {
    const payload = JSON.stringify(userData);
    return crypto.createHmac("sha256", COOKIE_SECRET).update(payload).digest("hex");
}

function verifyUserData(userData, signature) {
    const expected = signUserData(userData);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ── Cookie Config ──
const COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 };

// ── Middleware ──
app.use(cors({ credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

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

        // Normalize to plain JSON (converts ObjectId to string) so HMAC matches cookie round-trip
        const userData = JSON.parse(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
        }));
        const signature = signUserData(userData);
        res.cookie("user_sig", signature, COOKIE_OPTIONS);
        res.status(201).json({
            message: "Account created successfully",
            user: userData,
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

        // Normalize to plain JSON (converts ObjectId to string) so HMAC matches cookie round-trip
        const userData = JSON.parse(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
        }));
        const signature = signUserData(userData);
        res.cookie("user_sig", signature, COOKIE_OPTIONS);
        res.json({
            message: "Login successful",
            user: userData,
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

        // Normalize to plain JSON (converts ObjectId to string) so HMAC matches cookie round-trip
        const userData = JSON.parse(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
        }));
        const signature = signUserData(userData);
        res.cookie("user_sig", signature, COOKIE_OPTIONS);
        res.json({
            message: "Login successful",
            user: userData,
        });
    } catch (err) {
        console.error("Google auth error:", err.message);
        res.status(401).json({ message: "Invalid Google token" });
    }
});

// PUT update user profile (for Google users completing their profile)
app.put("/api/update-profile", async (req, res) => {
    try {
        const { userId, name, phone, address, city, country } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (address !== undefined) updateFields.address = address;
        if (city !== undefined) updateFields.city = city;
        if (country !== undefined) updateFields.country = country;

        const user = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Normalize to plain JSON (converts ObjectId to string) so HMAC matches cookie round-trip
        const userData = JSON.parse(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
        }));
        const signature = signUserData(userData);
        res.cookie("user_sig", signature, COOKIE_OPTIONS);
        res.json({
            message: "Profile updated successfully",
            user: userData,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Session Verification ──

// GET /api/me — verify the user cookie against the httpOnly signature
app.get("/api/me", (req, res) => {
    try {
        const userCookie = req.cookies.user;
        const sigCookie = req.cookies.user_sig;
        if (!userCookie || !sigCookie) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userData = JSON.parse(userCookie);
        if (!verifyUserData(userData, sigCookie)) {
            // Cookie was tampered with — clear everything
            res.clearCookie("user");
            res.clearCookie("user_sig");
            return res.status(403).json({ message: "Session invalid: cookie was tampered with" });
        }
        res.json({ user: userData });
    } catch (err) {
        res.clearCookie("user");
        res.clearCookie("user_sig");
        return res.status(403).json({ message: "Session invalid" });
    }
});

// POST /api/logout — clear httpOnly cookies
app.post("/api/logout", (req, res) => {
    res.clearCookie("user");
    res.clearCookie("user_sig");
    res.json({ message: "Logged out successfully" });
});

// ── Admin Middleware (verify httpOnly signed cookie) ──
function verifySignedCookie(req, res, next) {
    try {
        const userCookie = req.cookies.user;
        const sigCookie = req.cookies.user_sig;
        if (!userCookie || !sigCookie) {
            return res.status(401).json({ message: "Unauthorized: not logged in" });
        }
        const userData = JSON.parse(userCookie);
        if (!verifyUserData(userData, sigCookie)) {
            res.clearCookie("user");
            res.clearCookie("user_sig");
            return res.status(403).json({ message: "Forbidden: cookie was tampered with" });
        }
        req.verifiedUser = userData;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Forbidden: invalid cookie data" });
    }
}

// ── Admin Routes ──

// GET all users (admin only)
app.get("/api/admin/users", verifySignedCookie, async (req, res) => {
    try {
        const admin = req.verifiedUser;
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
app.delete("/api/admin/users/:id", verifySignedCookie, async (req, res) => {
    try {
        const admin = req.verifiedUser;
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        if (req.params.id === admin.id) {
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
app.put("/api/admin/users/:id/role", verifySignedCookie, async (req, res) => {
    try {
        const admin = req.verifiedUser;
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

// ── Cart Routes (authenticated users only) ──

// Helper: populate cart and format items for the frontend
async function getPopulatedCart(userId) {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) return [];
    return cart.items
        .filter(item => item.productId) // skip items whose product was deleted
        .map(item => ({
            _id: item.productId._id,
            productId: item.productId._id,
            product_name: item.productId.product_name,
            product_description: item.productId.product_description,
            product_image: item.productId.product_image,
            price: item.productId.price,
            category: item.productId.category,
            rating: item.productId.rating,
            quantity: item.quantity,
        }));
}

// GET /api/cart — fetch user's cart
app.get("/api/cart", verifySignedCookie, async (req, res) => {
    try {
        const items = await getPopulatedCart(req.verifiedUser.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/cart — add item to cart (or increment quantity if exists)
app.post("/api/cart", verifySignedCookie, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ userId: req.verifiedUser.id });

        if (!cart) {
            cart = new Cart({ userId: req.verifiedUser.id, items: [] });
        }

        const existingIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += (quantity || 1);
        } else {
            cart.items.push({ productId, quantity: quantity || 1 });
        }

        await cart.save();
        const items = await getPopulatedCart(req.verifiedUser.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/cart/merge — merge guest localStorage cart into DB cart on login
app.post("/api/cart/merge", verifySignedCookie, async (req, res) => {
    try {
        const { items } = req.body; // array of cart items from localStorage
        if (!items || !Array.isArray(items) || items.length === 0) {
            const populated = await getPopulatedCart(req.verifiedUser.id);
            return res.json(populated);
        }

        let cart = await Cart.findOne({ userId: req.verifiedUser.id });
        if (!cart) {
            cart = new Cart({ userId: req.verifiedUser.id, items: [] });
        }

        for (const guestItem of items) {
            const pid = guestItem._id || guestItem.productId;
            const existingIndex = cart.items.findIndex(
                (item) => item.productId.toString() === pid
            );
            if (existingIndex > -1) {
                cart.items[existingIndex].quantity += (guestItem.quantity || 1);
            } else {
                cart.items.push({
                    productId: pid,
                    quantity: guestItem.quantity || 1,
                });
            }
        }

        await cart.save();
        const populated = await getPopulatedCart(req.verifiedUser.id);
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/cart/:productId — update item quantity
app.put("/api/cart/:productId", verifySignedCookie, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.verifiedUser.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === req.params.productId
        );

        if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

        if (quantity < 1) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        const items = await getPopulatedCart(req.verifiedUser.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/cart/:productId — remove single item
app.delete("/api/cart/:productId", verifySignedCookie, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.verifiedUser.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== req.params.productId
        );

        await cart.save();
        const items = await getPopulatedCart(req.verifiedUser.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/cart — clear entire cart
app.delete("/api/cart", verifySignedCookie, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.verifiedUser.id });
        res.json({ message: "Cart cleared" });
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
