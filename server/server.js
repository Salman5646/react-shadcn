import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Cart from "./models/Cart.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret-change-in-production";

// ── JWT Helpers ──
const TOKEN_COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 };

function generateToken(userData) {
    return jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" });
}

function setTokenCookie(res, userData) {
    const token = generateToken(userData);
    res.cookie("token", token, TOKEN_COOKIE_OPTIONS);
}

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

// POST append a review to a product
app.post("/api/products/:id/reviews", verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }
        if (!comment || comment.trim() === "") {
            return res.status(400).json({ message: "Comment is required." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!req.verifiedUser || !req.verifiedUser.id) {
            return res.status(401).json({ message: "Invalid user session: missing ID" });
        }

        const userIdString = req.verifiedUser.id.toString();
        const mongoUserId = new mongoose.Types.ObjectId(userIdString);


        // Check if user already reviewed this product
        const existingReviewIndex = product.reviews.findIndex(
            (r) => r.userId && r.userId.toString() === userIdString
        );

        if (existingReviewIndex > -1) {
            // Use Mongoose subdocument set() for explicit change tracking
            product.reviews[existingReviewIndex].set({
                rating: Number(rating),
                comment: comment,
                createdAt: new Date()
            });
        } else {
            // Add new review using formal push to ensure casting
            product.reviews.push({
                userId: mongoUserId,
                userName: req.verifiedUser.name,
                rating: Number(rating),
                comment: comment,
                createdAt: new Date()
            });
        }

        // Recalculate average rating and count based on the updated reviews array
        const numReviews = product.reviews.length;
        const totalRating = product.reviews.reduce((sum, item) => sum + item.rating, 0);

        product.rating = {
            rate: Number((totalRating / (numReviews || 1)).toFixed(1)),
            count: numReviews
        };

        // Explicitly mark all modified paths to guarantee Mongoose save picks them up
        product.markModified('reviews');
        product.markModified('rating');

        console.log("Saving product to DB...");
        // Use a more direct update to be 100% sure it hits the DB
        const savedProduct = await product.save();

        // Final sanity check
        const checkProduct = await Product.findById(productId);

        res.status(existingReviewIndex > -1 ? 200 : 201).json({
            message: existingReviewIndex > -1 ? "Review updated successfully" : "Review added successfully",
            product: checkProduct
        });

    } catch (err) {
        console.error("Critical review storage error:", err);
        res.status(500).json({ message: "Database save failed: " + err.message });
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
        setTokenCookie(res, userData);
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
        setTokenCookie(res, userData);
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
        setTokenCookie(res, userData);
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
        setTokenCookie(res, userData);
        res.json({
            message: "Profile updated successfully",
            user: userData,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Session Verification ──

// GET /api/me — verify the JWT token cookie
app.get("/api/me", (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userData = jwt.verify(token, JWT_SECRET);
        // Strip JWT internal fields before sending to client
        const { iat, exp, ...user } = userData;
        res.json({ user });
    } catch (err) {
        res.clearCookie("token");
        return res.status(403).json({ message: "Session invalid" });
    }
});

// POST /api/logout — clear JWT token cookie
app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

// ── Auth Middleware (verify JWT token cookie) ──
function verifyToken(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: not logged in" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const { iat, exp, ...userData } = decoded;
        req.verifiedUser = userData;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.status(403).json({ message: "Forbidden: invalid or expired token" });
    }
}

// ── Admin Routes ──

// GET all users (admin only)
app.get("/api/admin/users", verifyToken, async (req, res) => {
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
app.delete("/api/admin/users/:id", verifyToken, async (req, res) => {
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
app.put("/api/admin/users/:id/role", verifyToken, async (req, res) => {
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
app.get("/api/cart", verifyToken, async (req, res) => {
    try {
        const items = await getPopulatedCart(req.verifiedUser.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/cart — add item to cart (or increment quantity if exists)
app.post("/api/cart", verifyToken, async (req, res) => {
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
app.post("/api/cart/merge", verifyToken, async (req, res) => {
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
app.put("/api/cart/:productId", verifyToken, async (req, res) => {
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
app.delete("/api/cart/:productId", verifyToken, async (req, res) => {
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
app.delete("/api/cart", verifyToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.verifiedUser.id });
        res.json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/products/:id/reviews — remove user's review
app.delete("/api/products/:id/reviews", verifyToken, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.verifiedUser.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const reviewIndex = product.reviews.findIndex(
            (r) => r.userId && r.userId.toString() === userId.toString()
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Remove the review
        product.reviews.splice(reviewIndex, 1);

        // Recalculate average rating and count
        const numReviews = product.reviews.length;
        const totalRating = product.reviews.reduce((sum, item) => sum + item.rating, 0);

        product.rating = {
            rate: numReviews > 0 ? Number((totalRating / numReviews).toFixed(1)) : 0,
            count: numReviews
        };

        product.markModified('reviews');
        product.markModified('rating');

        await product.save();
        res.json({ message: "Review deleted successfully", product });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Forgot Password (OTP via Email) ──

function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

// POST /api/forgot-password — generate and email a 6-digit OTP
app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email" });

        if (user.googleId && !user.password) {
            return res.status(400).json({ message: "This account uses Google Sign-In. Password reset is not available." });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Hash OTP before storing
        const hashedOtp = await bcrypt.hash(otp, 10);
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send email
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Shopr" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Shopr Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h2 style="color: #111827; margin-bottom: 8px;">Reset Your Password</h2>
                    <p style="color: #6b7280;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
                    <div style="text-align: center; margin: 24px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #111827;">${otp}</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        });

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error("Forgot password error:", err.message);
        res.status(500).json({ message: "Failed to send OTP. Try again." });
    }
});

// POST /api/verify-otp — verify the OTP
app.post("/api/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "No OTP request found. Please request a new one." });
        }

        if (new Date() > user.otpExpiry) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        res.json({ message: "OTP verified" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/reset-password — set new password after OTP verified
app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP and new password are required" });
        }

        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "No OTP request found. Please start over." });
        }

        if (new Date() > user.otpExpiry) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        // Hash and save new password, clear OTP fields
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Issue a fresh JWT so user is immediately logged in
        const userData = JSON.parse(JSON.stringify({
            id: user._id, name: user.name, email: user.email, role: user.role,
            phone: user.phone, address: user.address, city: user.city, country: user.country,
        }));
        setTokenCookie(res, userData);

        res.json({ message: "Password reset successful", user: userData });
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
