import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        type: {
            type: String,
            enum: ["welcome", "reward", "purchase", "refund", "admin_adjustment"],
            required: true
        },
        description: { type: String, required: true },
        balanceAfter: { type: Number }, // Optional: snapshots the balance after this transaction
    },
    { timestamps: true }
);

const CoinTransaction = mongoose.model("CoinTransaction", coinTransactionSchema);
export default CoinTransaction;
