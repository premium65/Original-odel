import mongoose from "mongoose";

const adClickSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ad", required: true },
  earnings: { type: Number, default: 101.75 },
  clickedAt: { type: Date, default: Date.now }
});

export default mongoose.model("AdClick", adClickSchema);
