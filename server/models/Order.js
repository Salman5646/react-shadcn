import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    product_name: { type: String, required: true },
    product_image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true },
        paymentMethod: { type: String, default: "Shopr Coins" },
        deliveryAddress: {
            address: { type: String, default: "Online Delivery" },
            city: { type: String, default: "N/A" },
            country: { type: String, default: "India" }
        },
        estimatedDelivery: { type: Date },
        shippedAt: { type: Date },
        outForDeliveryAt: { type: Date },
        deliveredAt: { type: Date },
        returnedAt: { type: Date },
        cancelledAt: { type: Date },
        refundedAt: { type: Date },
        returnReason: { type: String },
        status: {
            type: String,
            enum: ["Out for Delivery", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded", "Returned"],
            default: "Processing"
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
