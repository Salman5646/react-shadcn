import mongoose from "mongoose";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";

// Helper function to simulate distance/time mapping
// To make it testable for the user today, we will scale time so:
// 1 "Simulated Day" = 1 minute of real time
const ONE_SIMULATED_DAY = 60 * 1000;

function calculateShippingDays(origin, destination) {
    if (!origin || !destination || origin === destination) {
        return 2; // 2 days minimum
    }
    const hash = origin.length + destination.length;
    return (2 + (hash % 3)); // 2 to 4 days
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
                    if (order.returnedAt && (now - new Date(order.returnedAt).getTime() > ONE_SIMULATED_DAY)) {
                        order.status = "Refunded";
                        await order.save();
                        console.log(`[OrderUpdater] Order ${order._id} automatically Refunded`);
                    }
                    continue; // skip forward movement
                }

                // --- 2. Handle Forward Delivery Pipeline ---
                const orderTime = new Date(order.createdAt).getTime();
                const timeElapsedMs = now - orderTime;

                const firstItemOrigin = order.items.length > 0 && order.items[0].productId ?
                    order.items[0].productId.origin_location : "Warehouse";

                const shippingDays = calculateShippingDays(firstItemOrigin, order.deliveryAddress?.city);
                const totalShippingTimeMs = shippingDays * ONE_SIMULATED_DAY;

                let updatedStatus = null;

                // Timetable (scaled so 1 day = 1 minute):
                // > 1 day elapsed: Shipped
                // > (totalShippingTime / 2): Out for Delivery
                // > totalShippingTime : Delivered

                if (order.status === "Processing" && timeElapsedMs > (1 * ONE_SIMULATED_DAY)) {
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

        } catch (error) {
            console.error("[OrderUpdater] Error running loop:", error.message);
        }
    }, 30000); // 30 seconds
};
