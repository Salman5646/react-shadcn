import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },
    googleId: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, default: "India", trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
