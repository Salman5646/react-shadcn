import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        product_name: { type: String, required: true },
        product_description: { type: String, required: true },
        product_image: { type: String, required: true },
        product_image_transparent: { type: String, required: false },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        rating: {
            rate: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
