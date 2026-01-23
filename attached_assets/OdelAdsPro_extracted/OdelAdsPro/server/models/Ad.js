import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  adCode: { type: String, required: true, unique: true },
  title: { type: String },
  description: { type: String },
  duration: { type: Number, default: 10 }, // seconds
  price: { type: Number, default: 101.75 }, // reward per click in LKR
  link: { type: String, required: true },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ad", adSchema);
