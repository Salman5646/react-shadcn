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
        status: {
            type: String,
            enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Refunded","Returned"],
            default: "Processing"
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
