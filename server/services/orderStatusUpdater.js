import mongoose from "mongoose";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// 1 Day = 24 hours
const ONE_DAY = 24 * 60 * 60 * 1000;

export function calculateShippingDays(originLocation, destCity, destCountry) {
    if (!originLocation || !destCity || !destCountry) return 3; // default fallback

    // originLocation is expected to be formatted as "City, Country"
    const parts = originLocation.split(",");
    const originCity = parts[0]?.trim() || "";
    const originCountry = parts[1]?.trim() || "";

    if (originCity.toLowerCase() === destCity.toLowerCase()) {
        return 1; // Same city = 1 day
    } else if (originCountry.toLowerCase() === destCountry.toLowerCase()) {
        return 2; // Same country, different city = 2 days
    } else {
        return 3; // Different country = 3 days
    }
}

export const startOrderStatusUpdater = () => {
    console.log("🚛 Dynamic Order Status Updater Started (Daily Rules Active)");

    // Run every 30 seconds
    setInterval(async () => {
        try {
            // Find all active orders that haven't reached an end-state
            const activeOrders = await Order.find({
                status: { $in: ["Processing", "Shipped", "Out for Delivery", "Returned"] }
            }).populate("items.productId", "origin_location");

            if (!activeOrders.length) return;

            
            const now = Date.now();

            for (const order of activeOrders) {

                // --- 1. Handle Automatic Refund after 24 hrs of Return ---
                if (order.status === "Returned") {
                    // Process automated refund strictly after 24 real hours
                    if (order.returnedAt && (now - new Date(order.returnedAt).getTime() > ONE_DAY)) {
                        order.status = "Refunded";
                        await order.save();
                        
                        // Refund coins to user
                        if (order.userId && order.totalAmount) {
                            try {
                                const user = await User.findById(order.userId);
                                if (user) {
                                    user.coins = Math.round(((user.coins ?? 0) + order.totalAmount) * 100) / 100;
                                    await user.save();
                                }
                                
                                // Send notification
                                await Notification.create({
                                    userId: order.userId,
                                    title: "Refund Processed 💰",
                                    message: `Your return for order #${order._id.toString().slice(-8).toUpperCase()} has been processed and ${order.totalAmount} coins have been refunded to your account.`,
                                    type: "success",
                                });
                            } catch (err) {
                                console.error("[OrderUpdater] Failed to process refund side-effects:", err);
                            }
                        }

                        console.log(`[OrderUpdater] Order ${order._id} automatically Refunded`);
                    }
                    continue; // skip forward movement
                }

                // --- 2. Handle Forward Delivery Pipeline ---
                const orderTime = new Date(order.createdAt).getTime();
                const timeElapsedMs = now - orderTime;

                const firstItemOrigin = order.items.length > 0 && order.items[0].productId ?
                    order.items[0].productId.origin_location : "Warehouse";

                const shippingDays = calculateShippingDays(
                    firstItemOrigin,
                    order.deliveryAddress?.city,
                    order.deliveryAddress?.country
                );
                let updatedStatus = null;

                const totalShippingTimeMs = shippingDays * ONE_DAY;

                // Timetable:
                // > 1 day elapsed: Shipped
                // > (totalShippingTime / 2): Out for Delivery
                // > totalShippingTime : Delivered

                if (order.status === "Processing" && timeElapsedMs > (1 * ONE_DAY)) {
                    updatedStatus = "Shipped";
                } else if (order.status === "Shipped" && timeElapsedMs > (totalShippingTimeMs / 2)) {
                    updatedStatus = "Out for Delivery";
                } else if (order.status === "Out for Delivery" && timeElapsedMs > totalShippingTimeMs) {
                    updatedStatus = "Delivered";
                }

                if (updatedStatus) {
                    console.log(`[OrderUpdater] Order ${order._id} updated to ${updatedStatus}`);

                    order.status = updatedStatus;
                    if (updatedStatus === "Delivered") {
                        order.deliveredAt = new Date();
                    }
                    await order.save();

                    // Send notification ONLY for Delivered status
                    if (updatedStatus === "Delivered" && order.userId) {
                        try {
                            await Notification.create({
                                userId: order.userId,
                                title: `Order Delivered 📦!`,
                                message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has arrived.`,
                                type: "success",
                            });
                        } catch (err) {
                            console.error("[OrderUpdater] Failed to send notification", err);
                        }
                    }
                }
            }

        } catch (err) {
            console.error("[OrderUpdater] Error updating statuses:", err);
        }
    }, 60 * 1000); // Check every 1 minute
};
