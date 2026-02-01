import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetUsername: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Rating", ratingSchema);
