import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  adCode: { type: String, unique: true, required: true }, // AD-0001, etc
  title: String,
  description: String,
  duration: { type: Number, default: 10 }, // seconds
  price: { type: Number, default: 101.75 }, // LKR per click
  link: { type: String, required: true },
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Ad", adSchema);
